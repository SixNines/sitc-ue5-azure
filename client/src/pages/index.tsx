import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import { getTotalCost, stackStatuses } from "services/shared-service";
import * as httpService from "services/http-service";
import { AuthorizedRoute } from "components";
import { Button, Card, Modal } from "react-bootstrap";
import { AuthContext } from "components/auth/auth-context";
import { AuthorizationStatus } from "interfaces";
import { IndexListItem } from "interfaces/index-list-item";
import { InstanceStateCode } from "interfaces/instance/instance-state-code";
import { InstanceDetails } from "interfaces/instance/instance-details";

function getStackStatus(defaultStatus: string) {
  const stackStatus = stackStatuses.find(
    (status) => status.status == defaultStatus
  )?.mapping;

  return stackStatus != undefined ? stackStatus : "";
}

function isValidUrl(url: string) {
  const urlExpression =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  return urlExpression.test(url);
}

function setSlideValue(stateCode: InstanceStateCode) {
  //console.log("state code ", stateCode);
  if (stateCode === InstanceStateCode.Running) {
    return false;
  }

  return true;
}

const StackList = () => {
  const router = useRouter();

  const [stackItems, setItems] = useState<IndexListItem[]>([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    let stackItems = await httpService.getStackItems();

    if (httpService.isError(stackItems)) {
      if (stackItems.authorized === false || stackItems.status === 401) {
        authContext.setAuthStatus({
          status: AuthorizationStatus.UNAUTHORIZED,
        });
        router.push("/auth/login");
      }
      return;
    }

    let listItems: IndexListItem[] = [];

    let otherStacks = stackItems.filter((stack) => {
      return (
        stack.StackStatus != "UPDATE_COMPLETE" &&
        stack.StackStatus != "DELETE_COMPLETE"
      );
    });

    for (let i = 0; i < otherStacks.length; i++) {
      const stack = otherStacks[i];

      const stackDetails = await httpService.getStackDetails(stack.StackName);
      if (httpService.isError(stackDetails)) {
        // Do error stuff.
        return;
      }

      const instance = await httpService.getInstanceId(stack.StackName);
      let instanceId: string;

      // Need to allow things to progress, as the instance ID may not exist yet, due to instance creation taking place.
      // Failure to add this results in the instance being created, not showing up in the UI.
      if (
        !(
          httpService.isError(instance) ||
          instance.instanceId === "" ||
          instance.instanceId === null
        )
      ) {
        // Do error stuff
        instanceId = instance.instanceId;
      } else {
        instanceId = "";
      }

      let instanceDetails: InstanceDetails = {
        StateCode: InstanceStateCode.Pending,
        PublicIpAddress: "",
        VolumeId: "",
        InstanceType: "",
      };

      let instanceCost: string = "";
      if (instanceId !== "") {
        const tempInstanceDetails = await httpService.getInstanceStatus(
          instanceId
        );

        if (httpService.isError(instanceDetails)) {
          // Do error stuff
        } else {
          instanceDetails = tempInstanceDetails as InstanceDetails;
        }

        const volumeDescription = await httpService.getVolumeDescription(
          instanceDetails.VolumeId
        );

        if (httpService.isError(volumeDescription)) {
          return;
        }

        instanceCost = `$${getTotalCost(
          instanceDetails.InstanceType,
          volumeDescription.Size
        )}`;
      }

      if (
        instanceDetails.PublicIpAddress !== "" &&
        instanceDetails.PublicIpAddress !== null &&
        instanceDetails.PublicIpAddress !== undefined
      ) {
        instanceDetails.PublicIpAddress = instanceDetails.PublicIpAddress;
      } else {
        instanceDetails.PublicIpAddress =
          instanceDetails.StateCode === undefined
            ? InstanceStateCode[InstanceStateCode.Pending]
            : InstanceStateCode[instanceDetails.StateCode];
      }

      const listItem: IndexListItem = {
        StackStatus: getStackStatus(stack.StackStatus),
        StackName: stack.StackName,
        DcvUrl: instanceDetails.PublicIpAddress,
        Cost: instanceCost,
        StateCode: instanceDetails.StateCode,
      };

      listItems.push(listItem);
    }

    setItems(listItems);
  };

  const [show, setShow] = useState(false);
  const handleClose = async (isDelete: boolean) => {
    if (isDelete == true) {
      const destroyKeypairResponse = await httpService.destroyKeypair(
        selectedResourceName
      );
      if (!destroyKeypairResponse.error) {
        // Do error stuff.
      }

      const destroyResourceResponse = await httpService.destroyResource(
        selectedResourceName
      );
      if (!destroyResourceResponse.error) {
        // Do error stuff.
      }

      router.reload();
    }

    setShow(false);
  };

  const [selectedResourceName, setSelectedResourceName] = useState("");

  const handleShow = (resourceName: string) => {
    setSelectedResourceName(resourceName);
    setShow(true);
  };

  const stopInstance = async (stackName: string) => {
    const instance = await httpService.getInstanceId(stackName);
    if (httpService.isError(instance) || instance.instanceId === "") {
      // Do error stuff
      return;
    }

    const stopResponse = await httpService.stopInstance(instance.instanceId);
    if (httpService.isError(stopResponse)) {
      // Do error stuff.
      return;
    }
    await fetchData();
    //router.reload();
  };

  const startInstance = async (stackName: string) => {
    const instance = await httpService.getInstanceId(stackName);
    if (httpService.isError(instance) || instance.instanceId === "") {
      // Do error stuff
      return;
    }

    const startResponse = await httpService.startInstance(instance.instanceId);
    if (httpService.isError(startResponse)) {
      // Do error stuff.
      return;
    }
    await fetchData();
    //router.reload();
  };

  const onStartStopClicked = async (stackName: string, element: any) => {
    const input = element;

    if (input.target.checked) {
      console.log("stopping.");
      await stopInstance(stackName);
    } else {
      console.log("starting");
      await startInstance(stackName);
    }
  };

  return (
    <AuthorizedRoute adminRoute={false}>
      <div className="container indexPage">
        <Card className="index-card shadow-sm" key={"dark"} bg={"dark"}>
          <Card.Body>
            <div className="row create-resource-row">
              <div className="col">
                <h2>View Workstations</h2>
              </div>
              <div className="col create-container">
                <button
                  className="btn btn-success btn-create-resource"
                  onClick={() => {
                    router.push("/create");
                  }}
                >
                  Create Workstation
                </button>
              </div>
            </div>
            <div className="row">
              <table className="table text-color">
                <thead>
                  <tr>
                    <th scope="col">Workstation Name</th>
                    <th scope="col">Build Stage</th>
                    <th scope="col">Connection URL</th>
                    <th scope="col">Hourly Estimate</th>
                    <th scope="col">Start / Stop</th>
                    <th scope="col">Delete Workstation</th>
                  </tr>
                </thead>
                <tbody>
                  {stackItems?.map((item, idx) => (
                    <tr key={`stack-item-${idx}`}>
                      <td>{item.StackName}</td>
                      <td>{item.StackStatus}</td>
                      <td>
                        {!isValidUrl(item.DcvUrl) ? item.DcvUrl : item.DcvUrl}
                      </td>
                      <td>{item.Cost}</td>
                      <td>
                        <div className="form-check form-switch start-stop-div">
                          <input
                            id={item.StackName}
                            type="checkbox"
                            className="form-check-input start-stop-switch"
                            defaultChecked={setSlideValue(item.StateCode)}
                            disabled={
                              item.StateCode !== InstanceStateCode.Running &&
                              item.StateCode !== InstanceStateCode.Stopped
                            }
                            onChange={(e) =>
                              onStartStopClicked(item.StackName, e)
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleShow(String(item.StackName))}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>

          <Modal show={show} onHide={() => handleClose(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Workstation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                You are about to delete the workstation:{" "}
                <b>{selectedResourceName}</b>.
              </p>

              <p>This action can not be reversed.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                className="btn-delete-cancel"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleClose(true)}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Card>
      </div>
    </AuthorizedRoute>
  );
};

export default StackList;
