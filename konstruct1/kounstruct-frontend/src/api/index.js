import axiosInstance from "./axiosInstance";
import { projectInstance } from "./axiosInstance";
import { organnizationInstance } from "./axiosInstance"

export const login = async (data) =>
  axiosInstance.post("/token/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createUser = async (data) =>
  axiosInstance.post("/user/create-user/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createOrganization = async (data) =>
  organnizationInstance.post("/organizations/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createCompany = async (data) =>
  organnizationInstance.post("/company/create-company/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  export const createProject = async (data) =>
    projectInstance.post("/projects/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


export const getUserDetailsById = async (id) =>
  axiosInstance.get(`/users/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getOrganizationDetailsById = async (id) =>
  axiosInstance.get(`/organizations/by-user/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getCompanyDetailsById = async (id) =>
  axiosInstance.get(
    `/company/get-company-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getProjectDetailsById = async (id) => {
  console.log(id, "id project");
  return axiosInstance.get(
    `/project/get-project-details-by-company-id/?company_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getProjectDetails = async () =>
  projectInstance.get("/project/get-project-details/", {
    headers: {
      "Content-Type": "application/json",

    },
  });

export const createPurpose = async (data) =>
  projectInstance.post("purposes/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getPurposeByProjectId = async (id) =>
  projectInstance.get(`purpose/get-purpose-details-by-project-id/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


  export const createPhase = async (data) =>
    projectInstance.post("phase/create-phases/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  

export const getPhaseDetailsByProjectId = async (id) =>
  projectInstance.get(`phases/by-project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createStage = async (data) =>
  projectInstance.post("stages/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getStageDetailsByProjectId = async (id) =>
  projectInstance.get(`get-stage-details-by-project-id/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createTower = async (data) =>
  axiosInstance.post("/tower/create-tower/", data, {
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  });

export const getTowerDetailsByProjectId = async (id) =>
  axiosInstance.get(`/tower/get-tower-details-by-id/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateTower = async (data) =>
  axiosInstance.put("/tower/update-tower-details-by-id/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createLevel = async (data) =>
  axiosInstance.post("/level/create-level/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getLevelsByTowerId = async (id) =>
  axiosInstance.get(`/level/get-level-details-by-tower-id/?tower_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateLevel = async (data) =>
  axiosInstance.put("/level/update-level-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const deleteLevel = async (id) =>
  axiosInstance.delete(`/level/delete-level-details/?level_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createRoom = async (data) =>
  axiosInstance.post("/room/create-room/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getRooms = async (id) =>
  axiosInstance.get(`/room/get-room-details-by-company-id/?company_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createFlatType = async (data) =>
  axiosInstance.post("/flat-type/create-flat-type/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFlatTypes = async (id) =>
  axiosInstance.get(
    `/flat-type/get-flat-type-details-by-project-id/?project_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const updateFlatType = async (data) => {
  console.log(data, "DATA FLAT TYPE");
  return axiosInstance.put("/flat-type/update-room-type-by-flat-type/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createUnit = async (data) =>
  axiosInstance.post("/unit/create-unit/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUnits = async (id) =>
  axiosInstance.get(`/unit/get-unit-details-by-project-id/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateUnit = async (data) =>
  axiosInstance.put("/unit/update-unit-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createTransferRule = async (data) =>
  axiosInstance.post("/transfer-rule/create-transfer-rule/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getTransferRules = async (id) => {
  return axiosInstance.get(
    `/transfer-rule/get-transfer-rule-by-project-id/?project_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const createChecklistCategory = async (data) =>
  axiosInstance.post("/category/create-category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getChecklistCategories = async (id) =>
  axiosInstance.get(
    `/category/get-category-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const createChecklistSubCategory = async (data) =>
  axiosInstance.post("/sub-category/create-sub-category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getChecklistSubCategories = async (id) =>
  axiosInstance.get(
    `/sub-category/get-sub-category-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const createChecklist = async (data) =>
  axiosInstance.post("/checklist-quest/create-checklist-quest/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getChecklistDetails = async (id) =>
  axiosInstance.get(
    `/checklist-quest/get-checklist-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const createChecklistMapping = async (data) =>
  axiosInstance.post(
    "/checklist-quest/mapping-data-with-category-checklist/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
export const getChecklistMappingDetails = async (id) =>
  axiosInstance.get(`/checklist-quest/get-mapping-data/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createUserDetails = async (data) =>
  axiosInstance.post("/user/create-user-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const updateChecklist = async (data) =>
  axiosInstance.put(
    "/checklist-quest/update-checklist-quest-by-checklist-id/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getUsersByOrganizationId = async (id) =>
  axiosInstance.get(
    `/user/get-user-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const updateUserDetails = async (data) =>
  axiosInstance.put("/user/update-user-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// export const getAllProjectDetails = async () =>
//   axiosInstance.get("/project/get-project-details/", {
//     headers: {
//       "Content-Type": "application/json",
//       //   "Access-Control-Allow-Origin": "*",
//     },
//   });

export const getProjectLevelDetails = async (id) =>
  axiosInstance.get(`/tower/get-tower-details-by-id/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFloorDetails = async (id) =>
  axiosInstance.get(`/level/get-level-details-by-tower-id/?tower_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFloorTypeDetails = async (id, projectId) =>
  axiosInstance.get(
    `/room/get-rooms-checklist-by-flat-type/?unit_id=${id}&project_id=${projectId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getSubCategoryChecklist = async (id) =>
  axiosInstance.get(
    `/sub-category/get-checklist-sub-category-by-category/?category_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getRoomsWiseChecklist = async (checkListId, roomId) =>
  axiosInstance.get(
    `/room-map/get-rooms-wise-checklist/?checklist_id=${checkListId}&room_id=${roomId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getstageDetails = async (projectId) =>
  axiosInstance.get(
    `/stage/get-stage-details-by-project-id/?project_id=${projectId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getProjectUserDetails = async (userId) =>
  axiosInstance.get(
    `/user-stage-role/get-projects-by-user/?user_id=${userId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const editStage = async (data) =>
  axiosInstance.put("/stage/update-stage-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
