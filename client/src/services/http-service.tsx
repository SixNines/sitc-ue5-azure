import {
  CreateRequest,
  AuthorizingUser,
  User,
  NewUser,
  UpdatedUser,
  UserRoles,
  ParsedResponse,
  UserAuthorizationResponse,
  AuthorizationStatus,
} from "interfaces";
import getConfig from "next/config";
import { instanceTypes } from "./shared-service";
import { ResponseStatuses } from "interfaces";
import { ListResponse } from "interfaces/deployment/list-response";
import { StackDescriptionResponse } from "interfaces/deployment/stack-description-response";
import { StackDetails } from "interfaces/deployment/stack-details";
import { CreateStackResponse } from "interfaces/deployment/create-stack-response";
import { InstanceDescribeResponse } from "interfaces/instance/instance-describe-response";
import { InstanceDetails } from "interfaces/instance/instance-details";
import { VolumeDescriptionResponse } from "interfaces/deployment/volume-description-response";

const { publicRuntimeConfig } = getConfig();
var user = {
  userName: "admin",
  password: "Password123!",
};

export function isError(response: any): response is ParsedResponse<unknown> {
  return "error" in response && "authorized" in response;
}

export async function fetchWithBoundary(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) {
  try {
    return {
      state: ResponseStatuses.RESPONSE_RETURNED,
      response: (await fetch(input, init)) as Response,
      error: false,
    };
  } catch (error) {
    return {
      state: ResponseStatuses.FETCH_ERROR,
      response: error as Error,
      error: true,
    };
  }
}

async function checkResponse<T>(
  response: Response | Error
): Promise<ParsedResponse<T>> {
  if (response instanceof Error) {
    return {
      data: null,
      status: 500,
      state: ResponseStatuses.API_ERROR,
      authorized: false,
      error: true,
      context: response.message,
    };
  }

  const errorResponse = {
    data: null,
    status: response.status,
    state: ResponseStatuses.API_ERROR,
    authorized: false,
    error: true,
    context: "",
  };

  if (response.status >= 200 && response.status < 300) {
    return {
      status: response.status,
      state: ResponseStatuses.SUCCESS,
      data: await response.json(),
      context: "OK",
      authorized: true,
      error: false,
    };
  }

  const data = await response.text();

  try {
    errorResponse.context = JSON.parse(data).message as string;
  } catch (error) {
    errorResponse.context = data as string;
  }

  errorResponse.authorized =
    errorResponse.context === AuthorizationStatus.UNAUTHORIZED ||
    response.status === 401;

  return errorResponse;
}

function getAuthHeaders() {
  let headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    "X-Auth-Key": publicRuntimeConfig.CUMULUS_AUTH_API_KEY,
  };

  const token = sessionStorage.getItem("X-Auth-Token");
  if (token) {
    headers["X-Auth-Token"] = token;
  }

  const refreshToken = sessionStorage.getItem("X-Refresh-Token");
  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  return new Headers(headers);
}

export async function getAuthToken() {
  const tokenResponse = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/authorize`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    }
  );

  if (tokenResponse.response instanceof Error) {
    return tokenResponse;
  }

  const token = tokenResponse.response?.headers.get("X-Auth-Token") as string;
  const refreshToken = tokenResponse.response?.headers.get(
    "X-Refresh-Token"
  ) as string;

  return {
    authToken: token,
    refreshToken: refreshToken,
  };
}

export async function checkAuthToken() {
  const authUrl = `${publicRuntimeConfig.BASE_URL}/api/auth/verify`;
  const adminAuthUrl = `${publicRuntimeConfig.BASE_URL}/api/auth/verify/admin`;

  const authResponse = await fetchWithBoundary(authUrl, {
    headers: getAuthHeaders(),
  });
  const adminResponse = await fetchWithBoundary(adminAuthUrl, {
    headers: getAuthHeaders(),
  });

  const parsedAuth = await checkResponse<{ authorized: boolean }>(
    authResponse.response as Response
  );

  if (!parsedAuth.data?.authorized) {
    parsedAuth.context = UserRoles.UNAUTHORIZED;
    return {
      ...parsedAuth.data,
      role: UserRoles.UNAUTHORIZED,
    };
  }

  const parsedAdminAuth = await checkResponse<{ authorized: boolean }>(
    adminResponse.response as Response
  );
  if (!parsedAdminAuth.data?.authorized) {
    return {
      ...parsedAuth.data,
      role: UserRoles.DEV,
    };
  }

  return {
    ...parsedAdminAuth.data,
    role: UserRoles.ADMIN,
  };
}

export async function getOpenApiSpec() {
  const apiSpec = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/openapi`,
    {
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    }
  );

  const parsed = await checkResponse(apiSpec.response as Response);

  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  const data = parsed.data as Record<string, unknown>;

  data.servers = [
    {
      url: publicRuntimeConfig.BASE_URL,
    },
  ];

  return data;
}

export async function getUser(userName: string) {
  const users = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/describe/${userName}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(users.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as User;
}

export async function getUsers(limit?: number) {
  const users = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/list/${limit}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(users.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as User[];
}

export async function createUser(user: NewUser) {
  const created = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/create`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    }
  );

  const parsed = await checkResponse(created.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as User;
}

export async function updateUser(user: UpdatedUser) {
  const updated = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/update`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    }
  );

  const parsed = await await checkResponse(updated.response as Response);

  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as User;
}

export async function deleteUser(userName: string) {
  const deleted = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/user/destroy/${userName}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(deleted.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as { message: string };
}

export async function authorize(user: AuthorizingUser) {
  const authorization = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    }
  );

  const authorizationResponse = await checkResponse(
    authorization.response as Response
  );

  if (
    authorizationResponse.authorized &&
    authorization.response instanceof Response
  ) {
    const token = authorization.response?.headers.get("X-Auth-Token") as string;
    sessionStorage.setItem("X-Auth-Token", token);

    const refreshToken = authorization.response?.headers.get(
      "X-Refresh-Token"
    ) as string;
    sessionStorage.setItem("X-Refresh-Token", refreshToken);
  }

  if (
    authorization.response instanceof Error ||
    authorizationResponse.error ||
    authorizationResponse.data === null
  ) {
    return {
      authorized: authorizationResponse.authorized,
      message: authorizationResponse.context,
    } as UserAuthorizationResponse;
  }

  if (authorizationResponse.authorized) {
    const token = authorization.response?.headers.get("X-Auth-Token") as string;
    sessionStorage.setItem("X-Auth-Token", token);
  }

  return authorizationResponse.data as UserAuthorizationResponse;
}

export async function createStack(request: CreateRequest) {
  const stack = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/deployment/create`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  );

  const parsed = await checkResponse(stack.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as CreateStackResponse; //Record<string, unknown>;
}

export async function getStackItems() {
  const stacks = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/deployment/list/all`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(stacks.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as ListResponse[];
}

export async function destroyResource(resourceName: string) {
  const resource = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/deployment/destroy/${resourceName}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(resource.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as Record<string, unknown>;
}

export async function createKeypair(resourceName: string) {
  const keypairRequest = { keyPairName: resourceName };
  const keypair = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/keypair/create`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(keypairRequest),
    }
  );

  const parsed = await checkResponse(keypair.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as Record<string, unknown>;
}

export async function destroyKeypair(keypairName: string) {
  const keypair = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/keypair/destroy/${keypairName}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(keypair.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as Record<string, unknown>;
}

export async function getStackDetails(resourceName: string) {
  let stackDetails: StackDetails = {
    DcvUrl: "",
    InstanceCost: "",
    Error: false,
  };

  try {
    const stacks = await fetchWithBoundary(
      `${publicRuntimeConfig.BASE_URL}/api/deployment/describe/${resourceName}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const parsed = await checkResponse(stacks.response as Response);

    if (parsed.error === true) {
      return parsed;
    }

    const stackData = parsed.data as StackDescriptionResponse[];

    // TODO: This shouldn't be needed, remove and test.
    stackDetails.InstanceCost = getInstancePrice(stackData);

    for (let i = 0; i < stackData?.length; i++) {
      const outputs = stackData[i].Outputs;

      for (let j = 0; j < outputs?.length; j++) {
        const output = outputs[j];

        if (output.OutputKey == "WindowsDcvURL") {
          stackDetails.DcvUrl = output.OutputValue as string;

          return stackDetails;
        }
      }
    }
  } catch (error) {
    return {
      ...stackDetails,
      error: true,
    };
  }

  return stackDetails;
}

function getInstancePrice(stacks: any) {
  for (let i = 0; i < stacks?.length; i++) {
    const parameters = stacks[i].Parameters;

    for (let j = 0; j < parameters?.length; j++) {
      const output = parameters[j];

      if (output.ParameterKey == "InstanceType") {
        let cost = instanceTypes.find(
          (instance) => instance.value == output.ParameterValue
        )?.cost;

        return cost as string;
      }
    }
  }

  return "";
}

export async function getInstanceId(stackName: string) {
  const instance = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/components/list/${stackName}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(instance.response as Response);
  if (parsed.error === true || parsed.data === null) {
    return parsed;
  }

  const data = parsed.data as Record<string, unknown>[];

  const selectedInstance = (await Promise.resolve(
    data
      .filter((instance: typeof data[0]) => {
        return instance.LogicalResourceId === "WindowsInstance";
      })
      .pop()
  )) as Record<string, string>;

  if (!selectedInstance) {
    return {
      instanceId: "",
    };
  }

  return {
    instanceId: selectedInstance.PhysicalResourceId,
  };
}

export async function stopInstance(physicalResourceId: string) {
  const instance = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/instance/stop/${physicalResourceId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(instance.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as Record<string, unknown>;
}

export async function startInstance(physicalResourceId: string) {
  const instance = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/instance/start/${physicalResourceId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(instance.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  return parsed.data as Record<string, unknown>;
}

export async function getInstanceStatus(instanceId: string) {
  let instanceDetails: InstanceDetails = {
    StateCode: 0,
    PublicIpAddress: "",
    VolumeId: "",
    InstanceType: "",
  };

  if (instanceId === "") {
    instanceDetails;
  }

  const instance = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/instance/describe/${instanceId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(instance.response as Response);
  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  const data = parsed.data as InstanceDescribeResponse[];

  for (let i = 0; i < data.length; i++) {
    const element = data[i];

    for (let j = 0; j < element.Instances.length; j++) {
      const instance = element.Instances[j];

      instanceDetails.PublicIpAddress = instance.PublicIpAddress;
      instanceDetails.StateCode = instance.State.Code;
      instanceDetails.VolumeId = instance.BlockDeviceMappings[0].Ebs.VolumeId;
      instanceDetails.InstanceType = instance.InstanceType;
    }
  }

  return instanceDetails;
}

export async function getVolumeDescription(volumeId: string) {
  const fetched = await fetchWithBoundary(
    `${publicRuntimeConfig.BASE_URL}/api/instance/describe/volume/${volumeId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const parsed = await checkResponse(fetched.response as Response);

  if (parsed.error || parsed.data === null) {
    return parsed;
  }

  const volumeResponse = parsed.data as VolumeDescriptionResponse[];

  return volumeResponse[0];
}
