import { FastifyInstance } from "fastify";
import {
    createGroup,
    addUserToGroup,
    removeUserFromGroup,
    blockUserInGroup,
    sendInvite,
    listGroupsInGraphicAccount,
    acceptInvite,
    rejectInvite,
    listAllGroups,
  } from "./groupController";  

  export async function GroupRoutes(app: FastifyInstance) {

    app.post('/', createGroup);
    app.post('/add-user', addUserToGroup);
    app.post('/remove-user', removeUserFromGroup);
    app.post('/block-user', blockUserInGroup);
    app.post('/invite', sendInvite);
    app.post('/accept-invite', acceptInvite);  // Nova rota
    app.post('/reject-invite', rejectInvite);  // Nova rota 
    app.get('/list-groups/:graphicAccountId', listGroupsInGraphicAccount);
    app.get('/list-all', listAllGroups);

  }
  
  