const { Router } = require("express");
const itemRoutes = require("./item.routes");

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE INDEX
//  Register every resource router here.
//  ADD YOUR OWN ROUTES below following the same pattern.
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

router.use("/items", itemRoutes);

// ADD MORE ROUTES HERE:
// const userRoutes = require("./user.routes");
// router.use("/users", userRoutes);

module.exports = router;
