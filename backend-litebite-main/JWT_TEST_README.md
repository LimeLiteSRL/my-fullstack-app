# JWT Authentication Tests

این فایل‌ها برای تست کامل فرایند JWT authentication ساخته شدن.

## فایل‌های تست:

### 1. `test-jwt-auth.ts` - تست کامل JWT
- تست کامل فرایند authentication
- تست token generation و validation
- تست database connection
- تست error handling

### 2. `simple-jwt-test.ts` - تست ساده JWT
- تست ساده token generation
- تست user lookup
- تست response format

### 3. `test-api-endpoints.ts` - تست API endpoints
- تست actual API endpoints
- تست Authorization header
- تست error cases

## نحوه اجرا:

### 1. تست کامل JWT:
```bash
cd backend-litebite
npx ts-node src/scripts/test-jwt-auth.ts
```

### 2. تست ساده JWT:
```bash
cd backend-litebite
npx ts-node src/scripts/simple-jwt-test.ts
```

### 3. تست API endpoints:
```bash
cd backend-litebite
npx ts-node src/scripts/test-api-endpoints.ts
```

## پیش‌نیازها:

1. **Database connection** باید فعال باشه
2. **Backend server** باید روی port 3000 اجرا بشه
3. **Dependencies** باید نصب باشن

## خروجی مورد انتظار:

### تست کامل:
```
🔐 Starting JWT Authentication Test Flow...

1️⃣ Connecting to database...
✅ Database connected

2️⃣ Cleaning up existing test user...
✅ Test user cleaned up

3️⃣ Creating test user...
✅ Test user created: { id: ..., email: 'test@example.com', name: 'Test User' }

4️⃣ Generating JWT token...
✅ JWT token generated: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

5️⃣ Decoding token (without verification)...
✅ Token decoded: { userId: '...', email: 'test@example.com', role: 'user', iat: ..., exp: ... }

6️⃣ Verifying token...
✅ Token verified: { userId: '...', email: 'test@example.com', role: 'user', iat: ..., exp: ... }

7️⃣ Finding user by token payload...
✅ User found: { id: '...', email: 'test@example.com', name: 'Test User', profilePicture: '...' }

8️⃣ Testing invalid token...
✅ Invalid token correctly rejected: invalid signature

9️⃣ Testing wrong JWT secret...
✅ Token correctly rejected with wrong secret: invalid signature

🔟 Testing expired token...
✅ Expired token correctly rejected: jwt expired

1️⃣1️⃣ Testing complete authentication flow...
✅ Login response: { success: true, token: '...', user: {...}, message: 'Login successful' }
✅ Token validation response: { valid: true, message: 'Token is valid and user exists', decoded: {...}, user: {...}, shouldClearToken: false }

🎉 All JWT authentication tests passed!

📋 Summary:
- ✅ Database connection
- ✅ User creation
- ✅ Token generation
- ✅ Token decoding
- ✅ Token verification
- ✅ User lookup
- ✅ Invalid token rejection
- ✅ Wrong secret rejection
- ✅ Expired token rejection
- ✅ Complete flow simulation

🧹 Cleaning up...
✅ Cleanup completed
```

## نکات مهم:

1. **JWT_SECRET** در همه فایل‌ها `"testtesttest"` هست
2. **Token expiration** 24 ساعت تنظیم شده
3. **Test users** بعد از تست پاک می‌شن
4. **Error handling** برای همه موارد تست شده

## عیب‌یابی:

اگر تست‌ها fail بشن:

1. **Database connection** رو چک کن
2. **Backend server** رو چک کن
3. **Environment variables** رو چک کن
4. **Dependencies** رو چک کن

