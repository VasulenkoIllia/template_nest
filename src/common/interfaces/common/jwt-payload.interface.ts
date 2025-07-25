/**
 * Інтерфейс корисного навантаження JWT токена
 * Визначає структуру даних, які зберігаються в JWT токені
 */
export interface IJwtPayload {
  id: number;      // Ідентифікатор користувача
  email: string;   // Електронна пошта користувача
  role: string;    // Роль користувача в системі
}
