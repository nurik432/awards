import { redirect } from "next/navigation";

// Самостоятельная регистрация отключена — учётные записи создаёт администратор
// через админ-панель. Любой заход на /register перенаправляется на страницу входа.
export default function RegisterPage() {
  redirect("/login");
}
