
import axiosInstance from "./axiosInstance";
import { projectInstance,checklistInstance} from "./axiosInstance";
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

  // api.js

export const createRoom = async (data) =>
  projectInstance.post("/rooms/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getRoomsByProject = async (projectId) =>
    projectInstance.get(`/rooms/by_project/?project_id=${projectId}`, {
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
  organnizationInstance.post("/companies/", data, {
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

  export const GEtbyProjectID = async (id) =>
    projectInstance.get(`/projects/${id}`, {  // ✅ Use the id parameter
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

export const allorgantioninfototalbyUser_id = async (id) =>
  organnizationInstance.get(`/user-orgnizationn-info/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getUserDetailsById = async (id) =>
  axiosInstance.get(`/users/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  
export const createEntity = async (data) =>
  organnizationInstance.post(`/entities/`,data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getOrganizationDetailsById = async (id) =>
  organnizationInstance.get(`/organizations/by-user/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getCompanyDetailsById = async (id) =>
  organnizationInstance.get(
    `/company/get-company-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getProjectDetailsById = async (id) => {
  console.log(id, "id project");
  return projectInstance.get(
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

  export const GetstagebyPhaseid = async (id) =>
    projectInstance.get(`stages/by_phase/${id}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  
export const deleteStage = async (id) => projectInstance.delete(`stages/${id}/`,{
  headers: {
    "Content-Type": "application/json",
  },
})

export const getStageDetailsByProjectId = async (id) =>
  projectInstance.get(`get-stage-details-by-project-id/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createTower = async (data) =>
  projectInstance.post("/buildings/", data, {
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  });

  export const fetchTowersByProject = async (id) =>
    projectInstance.get(`/buildings/by_project/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        //   "Access-Control-Allow-Origin": "*",
      },
    });

export const DeleteTowerByid = async (id) =>
      projectInstance.delete(`/buildings/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          //   "Access-Control-Allow-Origin": "*",
        },
      });

export const getBuildingnlevel = async (id)=>
  projectInstance.get(`buildings/with-levels/by_project/${id}/`,{
    headers: {
      "Content-Type": "application/json",
      //   "Access-Control-Allow-Origin": "*",
    },
  })

export const updateTower = async (towerId, data) =>
        projectInstance.patch(`/buildings/${towerId}/`, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      


// export const getTowerDetailsByProjectId = async (id) =>
//   axiosInstance.get(`/tower/get-tower-details-by-id/?project_id=${id}`, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });


export const createLevel = async (data) =>
  projectInstance.post("/levels/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getLevelsByTowerId = async (id) =>
  projectInstance.get(`/levels/by_building/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    
  });

  

export const getLevelsWithFlatsByBuilding = async (id) =>
  projectInstance.get(`/levels-with-flats/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });



export const updateLevel = async ({ id, name, building }) =>
  projectInstance.put(`/levels/${id}/`, { name, building }, {
    headers: { "Content-Type": "application/json" },
  });


export const deleteLevel = async (id) =>
  projectInstance.delete(`/levels/${id}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const NestedZonenSubzone=async (data)=>{
  projectInstance.post("buildings/with-levels-zones/bulk-create/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export const zonewithbluidlingwithlevel = async (id) =>
  projectInstance.get(
    `/buildings/with-levels-and-zones/by_project/${id}/`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );


// export const createRoom = async (data) =>
//   axiosInstance.post("/room/create-room/", data, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

export const getRooms = async (id) =>
  axiosInstance.get(`/room/get-room-details-by-company-id/?company_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createFlatType = async (data) =>
  projectInstance.post("/flattypes/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFlatTypes = async (id, token) =>
  projectInstance.get(`/flattypes/by_project/${id}/`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`,
    },
  });


export const updateFlatType = async (data) => {
  console.log(data, "DATA FLAT TYPE");
  return projectInstance.put(
    "/flat-type/update-room-type-by-flat-type/",
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};


export const createUnit = async (data) =>
  projectInstance.post("/flats/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getUnits = async (id) =>
  projectInstance.get(`flats/by_project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const allinfobuildingtoflat = async (id) =>
  projectInstance.get(`projects/${id}/buildings-details/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const updateUnit = async (data) =>
  projectInstance.put("/flats/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const createTransferRule = async (data) =>
  projectInstance.post("/transfer-rules/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getTransferRules = async (id) => {
  return projectInstance.get(`/transfer-rules/?project_id=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


export const createChecklistCategory = async (data) =>
  checklistInstance.post("/category/create-category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


export const getChecklistCategories = async (id) =>
  checklistInstance.get(
    `/category/get-category-details-by-organization-id/?organization_id=${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

export const getchecklistbyProject = async (id) =>
  checklistInstance.get(`checklists/?project=${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });


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

  export const getCategoriesSimpleByProject = async (projectId) =>
  projectInstance.get(`/categories-simple/?project=${projectId}`, {
    headers: { "Content-Type": "application/json" },
  });

  export const createCategorySimple = async (data) =>
  projectInstance.post(`/categories-simple/`, data, {
    headers: { "Content-Type": "application/json" },
  });


export const createChecklist = async (data) =>
  checklistInstance.post("/checklists/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });


  export const createChecklistItemOption = async (data) =>
    checklistInstance.post("/checklists/", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });


  export const createChecklistItemOPTIONSS = async (data) =>
      checklistInstance.post("/options/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });


export const createChecklistQuestion = async (data) =>
  checklistInstance.post("/items/", data, {
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
  axiosInstance.post("/users/", data, {
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
  organnizationInstance.get(`/user-orgnizationn-info/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });



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
  projectInstance.get(`/buildings/by_project/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getFloorDetails = async (id) =>
  projectInstance.get(`/levels/by_building/${id}`, {
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
  projectInstance.get(
    // `/user-stage-role/get-projects-by-user/?user_id=${userId}`,
    `/user-stage-role/get-projects-by-user/`,

    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
        
      },
    }
  );

export const editStage = async (data) =>
  axiosInstance.put("/stage/update-stage-details/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

// ! By Prathamesh- GET 

export const getProjectsByOrganization = async (organizationId) =>
  projectInstance.get(`/projects/by_organization/${organizationId}/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const getCategoryTreeByProject = async (projectId) => 
  projectInstance.get(`/category-tree-by-project/?project=${projectId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const createUserAccessRole = async (payload) => 
  axiosInstance.post(`/user-access-role/`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });


  export const getPhaseByPurposeId = async (purposeId) =>
    projectInstance.get(`phases/by-purpose/${purposeId}/`, {
      headers: { "Content-Type": "application/json" },
    });
  
  export const getStageByPhaseId = async (phaseId) =>
    projectInstance.get(`stages/by_phase/${phaseId}/`, {
      headers: { "Content-Type": "application/json" },
    });
  
export const getAccessibleChecklists = async (projectId, userId) =>
  checklistInstance.get(`/accessible-checklists/?project_id=${projectId}&user_id=${userId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
