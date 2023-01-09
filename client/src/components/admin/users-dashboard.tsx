// import {  useEffect, useState } from "react";
// import { getUsers } from "services/http-service";
// import { User } from "interfaces";
// // import { UserCard } from "./user-card";
// // import { UserCreateButton } from "./user-create-button";
// // import { UserRefreshButton } from "./user-refresh-button";
// import { UserDashboardStatus } from "interfaces";
//import { Card } from "react-bootstrap";

export const UsersDashboard = () => {
  //   const [limit, setLimit] = useState(10);
  //   const [dashboardStatus, setDashboardStatus] = useState<UserDashboardStatus>(
  //     UserDashboardStatus.INITIALIZED
  //   );
  //   console.log(dashboardStatus)
  //   const [users, setUsers] = useState<User[]>([]);

  //   useEffect(() => {
  //     const fetchUsers = async () => {
  //       const fetchedUsers = await getUsers(limit);

  //       if (Array.isArray(fetchedUsers)) {
  //         setUsers(fetchedUsers.map((user) => ({ ...user, password: "" })));
  //         setDashboardStatus(UserDashboardStatus.READY);
  //       }
  //     };

  //     fetchUsers();
  //   }, [limit]);

  //   const createUser = (newUser: User) => {
  //     const updatedUsers = [...users];
  //     updatedUsers.push(newUser);
  //     setUsers(updatedUsers);
  //   };

  //   const updateUser = (updatedUser: User, userIdx: number) => {
  //     const updatedUsers = [...users];
  //     updatedUsers[userIdx] = updatedUser;
  //     setUsers(updatedUsers);
  //   };

  //   const deleteUser = (userIdx: number) => {
  //     const updatedUsers = [...users];
  //     updatedUsers.splice(userIdx, 1);
  //     setUsers(updatedUsers);
  //   };

  //   const updateUserQueryLimit = (event: ChangeEvent<HTMLInputElement>) =>
  //     setLimit(parseInt(event.target.value) ?? 1);

  return {};
};
// <div className="container indexPage adminPage">
//   <Card className="index-card shadow-sm" key={"dark"} bg={"dark"}>
//     <Card.Body>
//       <div className="row create-resource-row">
//         <div className="col">
//           <h2>Admin Console</h2>
//         </div>
//         <div className="col create-container">
//           <button
//             className="btn btn-success btn-create-resource"
//             onClick={() => {}}
//           >
//             + Add User
//           </button>
//         </div>
//       </div>
//       <div className="row">
//         {/* <div className="col">User Name</div>
//         <div className="col">Access Level</div>
//         <div className="col"></div> */}
//       </div>
//       {/* {users.map((user, idx) => (
//         <div className="row">
//           <table className="table text-color">
//             <thead>
//               <tr>
//                 <td>User Name</td>
//                 <td>Access Level</td>
//                 <td></td>
//               </tr>
//             </thead>
//           </table>
//         </div> */}

//         // <tr>
//         //   <td>test</td>
//         //   <td>access</td>
//         //   <td>...</td>
//         // </tr>
//         // <div key={`user-${idx}`} className="row user-list-item">
//         //   <div className="col">{user.userName}</div>
//         //   <div className="col">{user.role}</div>
//         //   <div className="col">....</div>
//         // </div>
//       ))}
//     </Card.Body>
//   </Card>
// </div>
// <div className="container">
//   {dashboardStatus !== UserDashboardStatus.INITIALIZED ? (
//     <div className="">
//       <div className="row ">
//         {users.map((user, idx) => (
//           <div key={`user-${idx}`} className="userCardRow">
//             <UserCard
//               user={user}
//               userIdx={idx}
//               dashboardStatus={dashboardStatus}
//               setDashboardStatus={setDashboardStatus}
//               onUpdate={updateUser}
//               onDelete={deleteUser}
//             />
//           </div>
//         ))}
//       </div>
//       <div className="row userList userCreateContainer">
//         <div className="userCardRow">
//           <Card className="card shadow-sm bg-dark text-color userCreateCard card">
//             <div className="userCreateBtnContainer">
//               <UserCreateButton
//                 usersCount={users.length}
//                 onCreate={createUser}
//               />
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <div>Loading...</div>
//   )}
// </div>
// );
//};
