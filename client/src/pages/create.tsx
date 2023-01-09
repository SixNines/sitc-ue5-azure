import { useRouter } from "next/router";
import { FormEvent, useState, useContext } from "react";
import { CreateRequest } from "../interfaces";
import { Form, Card } from "react-bootstrap";
import axios from "axios";
import * as shared from "../services/shared-service";
import { createKeypair, createStack, isError } from "services/http-service";
import { FormInput, FormSelect } from "components/forms";
import { AuthorizedRoute } from "components";
import { AuthContext } from "components/auth/auth-context";
import { AuthorizationStatus } from "interfaces";

const minimumDiskSize = 500;

const defaultTierCost = 0.71;

const resourceNameExpression = "(^[a-zA-Z0-9-]{4,}$)";
const passwordExpression =
  "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&].{8,}$";

const Create = () => {
  const authContext = useContext(AuthContext);
  const [validated, setValidated] = useState(false);
  const [useUserIp, setUseUserIp] = useState(false);
  const [awsConfig, setAwsConfig] = useState<CreateRequest>({
    resourceName: "",
    operatingSystem: "WindowsServer2019",
    password: "",
    instanceType: "g4dn.xlarge",
    diskSize: "500",
    cidr: "0.0.0.0/0",
  });

  const defaultDiskCost = shared.getHourlyDiskCost(minimumDiskSize);
  const [diskCost, setDiskCost] = useState(defaultDiskCost);
  const [workstationCost, setWorkstationCost] = useState(defaultTierCost);

  const defaultHourlyCost = diskCost + workstationCost;
  const [totalHourlyCost, setTotalHourlyCost] = useState(defaultHourlyCost);

  const router = useRouter();

  const handleWorkstationChange = (workstationType: string) => {
    const cost = shared.instanceTypes.find(
      (instance) => instance?.value == workstationType
    )?.numericCost as number;

    setWorkstationCost(cost);

    handleHourlyCost(diskCost, cost);
  };

  const handleDiskSizeChange = (diskSize: number) => {
    const cost = shared.getHourlyDiskCost(diskSize);

    setDiskCost(cost);
    handleHourlyCost(cost, workstationCost);
  };

  const handleHourlyCost = (diskCost: number, workstationCost: number) => {
    const cost = diskCost + workstationCost;
    setTotalHourlyCost(cost);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);

    if (form.checkValidity() === true) {
      const createdKeypair = await createKeypair(awsConfig.resourceName);

      if (isError(createdKeypair)) {
        if (createdKeypair.authorized === false) {
          authContext.setAuthStatus({
            status: AuthorizationStatus.UNAUTHORIZED,
          });
          router.push("/auth/login");
        }
        event.preventDefault();
        event.stopPropagation();
        alert(
          `Unable to create workstation. A workstation or keypair with the name ${awsConfig.resourceName} may already exist`
        );

        router.push("/create");
      } else {
        await createStack(awsConfig);

        router.push("/");
      }
    }
  };

  // TODO: Add check for values on submit
  return (
    <AuthorizedRoute adminRoute={false}>
      <div className="container createPage">
        <Form
          noValidate
          validated={validated}
          className="create-container"
          onSubmit={submit}
        >
          <Card className="card shadow-sm bg-dark text-color">
            <div className="row no-gutters">
              <FormInput
                inputType="text"
                name="WorkstationName"
                value={awsConfig.resourceName}
                onChange={(value) => {
                  setAwsConfig({
                    ...awsConfig,
                    resourceName: value,
                  });
                }}
                options={{
                  placeholder: "Enter a Workstation Name",
                  helpMessage: `The Workstation Name is the name that will tag your AWS
                    resources, and can include letters (A-Z and a-z), numbers (0-9),
                    and dashes (-) and must be greater than three characters long.`,
                  className: "form-control backgroud-color",
                  formFeedback:
                    "Workstation Name does not meet validation requirements.",
                  pattern: resourceNameExpression,
                  required: true,
                }}
              />
            </div>
            <div className="row no-gutters">
              <FormInput
                inputType="password"
                name="AdminPassword"
                value={awsConfig.password}
                onChange={(value) => {
                  setAwsConfig({
                    ...awsConfig,
                    password: value,
                  });
                }}
                // validate={(password: string) => passwordExpression.test(password)}
                options={{
                  placeholder: "Enter Admin password.",
                  helpMessage: `Password for the "Administrator" user. Password must
                      contain at least one element from three of the following sets:
                      lowercase letters, uppercase letters, base 10 digits,
                      non-alphanumeric characters.`,
                  className: "form-control",
                  formFeedback: "Password does not meet requirements.",
                  pattern: passwordExpression,
                  required: true,
                }}
              />
            </div>
            <div className="row no-gutters">
              <div className="col no-gutters">
                <div className="row no-gutters">
                  <div className="col">
                    <FormSelect
                      name="performanceTier"
                      value={awsConfig.instanceType}
                      selectOptions={shared.instanceTypes.map(
                        (instanceType) => ({
                          label: instanceType.label,
                          value: instanceType.value,
                          description: `${instanceType.label} (${instanceType.cost} per hour)`,
                        })
                      )}
                      onChange={(value) => {
                        setAwsConfig({
                          ...awsConfig,
                          instanceType: value,
                        });
                        handleWorkstationChange(value);
                      }}
                      options={{
                        helpMessage: `Price estimate is based on 100% utilization for the hour.
                    Workstation can be stopped from the main page when not in use.`,
                        className: "form-control form-select",
                      }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor={`diskSize`}>Disk Size</label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          id="diskSize"
                          type="number"
                          value={awsConfig.diskSize}
                          name="diskSize"
                          required={true}
                          placeholder="Enter VM volume size in GB."
                          min={40}
                          aria-describedby={`diskSizeHelp`}
                          onChange={(event) => {
                            const newDiskSize = parseInt(event.target.value);
                            if (
                              newDiskSize >= minimumDiskSize &&
                              !isNaN(newDiskSize)
                            ) {
                              setAwsConfig({
                                ...awsConfig,
                                diskSize: `${newDiskSize}`,
                              });
                              handleDiskSizeChange(newDiskSize);
                            }
                          }}
                        />
                      </div>
                      <small id="diskSizeHelp" className="form-text text-muted">
                        Disk size in GB. A minimum of {minimumDiskSize}GB is
                        required to properly run UE5 resources.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col border border-white estimate-col">
                <h3>Hourly Cost Estimate (USD)</h3>
                <hr />
                <div className="row">
                  <div className="col col-label">Performance Tier</div>
                  <div className="col">${workstationCost}</div>
                </div>
                <div className="row">
                  <div className="col col-label">Disk Size</div>
                  <div className="col">${diskCost.toFixed(2)}</div>
                </div>
                <div className="row row-total">
                  <div className="col col-label">Total</div>
                  <div className="col">${totalHourlyCost.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="row ip-row">
              <div className="col">
                <FormInput
                  inputType="checkbox"
                  value={awsConfig.cidr}
                  name="cidr"
                  options={{
                    className: "form-check-input",
                    labelText:
                      "Only allow connections from current IP address.",
                  }}
                  onChange={async (_) => {
                    const ipSource = !useUserIp;
                    setUseUserIp(ipSource);

                    if (ipSource) {
                      const res = await axios.get(
                        "https://geolocation-db.com/json/"
                      );
                      setAwsConfig({
                        ...awsConfig,
                        cidr: `${res.data.IPv4}/32`,
                      });
                    } else {
                      setAwsConfig({
                        ...awsConfig,
                        cidr: "0.0.0.0/0",
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className="row row-create-cancel">
              <div className="col">
                <button
                  type="button"
                  className="btn btn-secondary btn-create-resource btn-cancel-create"
                  onClick={() => router.push("/")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-create-resource"
                >
                  Create
                </button>
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </AuthorizedRoute>
  );
};

export default Create;
