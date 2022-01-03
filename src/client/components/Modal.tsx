// import React from 'react';

// export interface ModalProps {
//   title: string;
//   body: React.ReactElement | string;
//   buttonText?: string;
//   onClose?: () => void;
// }

// const bodyOrString = (body: React.ReactElement | string) => {
//   if (React.isValidElement(body)) {
//     return body;
//   }
//   return <p>{body}</p>;
// };

// const Modal = (props: ModalProps): React.ReactElement => {
//   const body = bodyOrString(props.body);

//   return (
//     <div className="modal" tabIndex={-1}>
//       <div className="modal-dialog">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">{props.title}</h5>
//             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div className="modal-body">{body}</div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => props.onClose()}>
//               {props.buttonText || 'Close'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Modal;
