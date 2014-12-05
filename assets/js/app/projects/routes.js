'use strict';

var NewProjectData = require('./new_project_controller').resolve,
  ProjectData = require('./project_controller').resolve;

/**@ngInject*/
module.exports = function($stateProvider, USER_ROLES) {
  $stateProvider
    // add new project for solution
    .state('base.newProject', {
      url: "^/project/new",
      templateUrl: "/partials/new-project.html",
      data: {
        authorizedRoles: [USER_ROLES.user, USER_ROLES.admin]
      },
      resolve: NewProjectData,
      controller: "NewProjectController as newProjectCtrl"
    })
    // project details
    .state('base.project', {
      url: "^/project/:projectId",
      templateUrl: "/partials/project.html",
      resolve: ProjectData,
      controller: "ProjectController as projectCtrl"
    });
};