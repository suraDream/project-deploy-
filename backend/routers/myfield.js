const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middlewares/auth");

router.get("/myfields", authMiddleware, async (req, res) => {
  const { user_id } = req.user;

  try {
    const userRole = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [user_id]
    );
    const role = userRole.rows[0].role;

    if (role !== "admin" && role !== "field_owner") {
      return res
        .status(403)
        .json({ error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลสนามกีฬา" });
    }

    let query = `
      SELECT DISTINCT
        users.user_id,
        users.first_name,
        users.last_name,
        users.email,
        field.field_id,
        field.field_name,
        field.img_field,
        field.status
      FROM field
      INNER JOIN users ON field.user_id = users.user_id
      WHERE (field.status = 'ผ่านการอนุมัติ' OR field.status = 'รอตรวจสอบ' OR field.status = 'ไม่ผ่านการอนุมัติ')
    `;

    let values = [];

    if (role === "admin") {
      query += ` ORDER BY field.field_id DESC`;
    } else if (role === "field_owner") {
      query += ` AND field.user_id = $1 ORDER BY field.field_id DESC`;
      values = [user_id];
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching my fields:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสนาม" });
  }
});

module.exports = router;