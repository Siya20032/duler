const sequelize=require("../db"); require("../models");
(async()=>{try{await sequelize.authenticate();await sequelize.sync();console.log("Database synchronized successfully.");process.exit(0);}catch(e){console.error(e);process.exit(1);}})();
