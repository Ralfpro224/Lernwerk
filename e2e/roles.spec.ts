import { test, expect, request as apiRequest } from "@playwright/test";

test("teacher classes, student permissions and one-time rewards", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "API flow is viewport-independent");
  test.skip(!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD, "No seeded admin credentials");
  const admin = await apiRequest.newContext({ baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000" });
  const teacher = await apiRequest.newContext({ baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000" });
  const student = await apiRequest.newContext({ baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000" });
  let teacherId: string | undefined;
  let classId: string | undefined;
  let studentId: string | undefined;
  try {
    const adminLogin = await admin.post("/api/auth/login", { data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
    expect(adminLogin.status()).toBe(200);
    const teacherEmail = `teacher-${Date.now()}@example.test`;
    const createdTeacher = await admin.post("/api/admin/users", { data: { email: teacherEmail, displayName: "Test Lehrkraft", password: "teacher password 123", role: "TEACHER" } });
    expect(createdTeacher.status()).toBe(201);
    teacherId = (await createdTeacher.json()).user.id;
    expect((await teacher.post("/api/auth/login", { data: { email: teacherEmail, password: "teacher password 123" } })).status()).toBe(200);
    const createdClass = await teacher.post("/api/classes", { data: { name: "Testklasse" } });
    expect(createdClass.status()).toBe(201);
    const classroom = (await createdClass.json()).classroom;
    classId = classroom.id;
    const register = await student.post("/api/auth/register", { data: { email: `student-${Date.now()}@example.test`, password: "student password 123", displayName: "Test Kind" } });
    expect(register.status()).toBe(201);
    studentId = (await register.json()).user.id;
    expect((await student.post("/api/classes", { data: { name: "Forbidden" } })).status()).toBe(403);
    expect((await student.post("/api/classes/join", { data: { joinCode: classroom.joinCode } })).status()).toBe(200);
    const studentClass = await student.get(`/api/classes/${classId}`);
    expect(studentClass.status()).toBe(200);
    expect(JSON.stringify(await studentClass.json())).not.toContain("joinCode");
    expect((await student.post("/api/assignments", { data: { classId, lessonId: "seed-lesson-math" } })).status()).toBe(403);
    expect((await teacher.post("/api/assignments", { data: { classId, lessonId: "seed-lesson-math" } })).status()).toBe(201);
    const studentAssignments = await student.get("/api/assignments");
    expect((await studentAssignments.json()).assignments).toHaveLength(1);
    const lesson = await request.get("/api/lessons/seed-lesson-math");
    expect(JSON.stringify(await lesson.json())).not.toContain('"answer"');
    const first = await student.post("/api/attempts", { data: { questionId: "seed-q-single", response: "b" } });
    expect(first.status()).toBe(200);
    expect((await first.json()).earned).toBe(10);
    const again = await student.post("/api/attempts", { data: { questionId: "seed-q-single", response: "b" } });
    expect((await again.json()).earned).toBe(0);
    expect((await student.get("/api/progress")).status()).toBe(200);
    expect((await (await student.get("/api/progress")).json()).points).toBe(10);
    expect((await student.post("/api/attempts", { data: { questionId: "seed-q-single" } })).status()).toBe(400);
  } finally {
    if (classId) await teacher.delete(`/api/classes/${classId}`);
    if (studentId) await admin.delete(`/api/admin/users/${studentId}`);
    if (teacherId) await admin.delete(`/api/admin/users/${teacherId}`);
    await Promise.all([admin.dispose(), teacher.dispose(), student.dispose()]);
  }
});
