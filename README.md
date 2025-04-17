* group_project_fullstack_backend/
* ├── src/                           # Thư mục chính chứa mã nguồn
* │   ├── config/                    # Cấu hình (biến môi trường, kết nối DB)
* │   │   ├── env.ts
* │   │   └── database.ts
* │   ├── controllers/               # Logic xử lý HTTP
* │   │   ├── auth.controllers.ts
* │   │   ├── event.controllers.ts
* │   │   └── user.controllers.ts
* │   ├── services/                  # Logic nghiệp vụ (business logic)
* │   │   ├── auth.validation.ts
* │   │   ├── event.service.ts
* │   │   └── user.service.ts
* │   ├── models/                    # Schema và model MongoDB
* │   │   ├── event.models.ts
* │   │   ├── user.models.ts
* │   │   └── participant.models.ts
* │   ├── routes/                    # Định tuyến API
* │   │   ├── auth.routes.ts
* │   │   ├── event.routes.ts
* │   │   └── user.routes.ts
* │   ├── middlewares/               # Middleware
* │   │   ├── auth.middleware.ts
* │   │   ├── error.middleware.ts
* │   │   └── oneUser.middleware.ts
* │   ├── helpers/                   # Hàm tiện ích
* │   │   ├── httpsError.helpers.ts
* │   │   └── jwtGenerate.helper.ts
* │   ├── enums/                     # Giá trị liệt kê
* │   │   ├── eventType.enums.ts
* │   │   └── participationStatus.enums.ts
* │   ├── interfaces/                # Định nghĩa interface
* │   │   ├── event.interfaces.ts
* │   │   └── user.interfaces.ts
* │   ├── types/                     # Định nghĩa type (tùy chọn)
* │   │   ├── websocket.types.ts
* │   │   └── graphql.types.ts
* │   ├── realtime/                  # Logic WebSocket (nhắn tin, thông báo, RSVP)
* │   │   ├── websocket.ts
* │   │   ├── chat.service.ts
* │   │   ├── notification.service.ts
* │   │   └── invitation.service.ts
* │   ├── graphql/                   # Logic GraphQL (cho tương lai)
* │   │   ├── schema/
* │   │   ├── resolvers/
* │   │   └── index.ts
* │   ├── docs/                      # Tài liệu API (Swagger/OpenAPI)
* │   │   └── swagger.json
* │   ├── logs/                      # File log
* │   │   └── app.log
* │   ├── app.ts                     # File chính khởi động ứng dụng
* │   └── index.ts                   # Entry point (tùy chọn)
* ├── tests/                         # Test (unit, integration)
* │   ├── controllers/
* │   ├── services/
* │   ├── websocket/
* │   └── integration/
* ├── .env.development.local         # Biến môi trường (development)
* ├── .env.production.local          # Biến môi trường (production)
* ├── .gitignore                     # File Git ignore
* ├── Dockerfile                     # Container hóa ứng dụng
* ├── docker-compose.yml             # Cấu hình Docker Compose
* ├── eslint.config.mjs              # Cấu hình ESLint
* ├── package.json                   # Quản lý dependency
* ├── package-lock.json              # Lock file dependency
* ├── README.md                      # Tài liệu dự án
* ├── LICENSE                        # Giấy phép
* └── tsconfig.json                  # Cấu hình TypeScript