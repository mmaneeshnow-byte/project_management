================================================================
MOCK INTERVIEW — PROJECT MANAGEMENT API
(Questions & Answers based on your actual project_management code)
================================================================

HOW THE PROJECT WORKS (quick flow first)
----------------------------------------
1. Client calls POST /auth/register with {name, userId, email,
   password, role, experience}.
2. authService hashes the password with bcrypt and stores it.
   It returns a JWT token.
3. Client calls POST /auth/login -> gets a token if credentials match.
4. For every other request (/users, /projects, /tasks), the client
   sends the token in the Authorization header: "Bearer <token>".
5. The auth middleware verifies the token. If valid, it lets the
   request reach the controller.
6. Controller -> Service -> Model -> MongoDB.
7. When creating a Project or Task, the service checks that the
   referenced user/project actually exists (referential validation).
8. When returning data, .populate() replaces raw IDs with the actual
   related documents.

Architecture layers:
  routes -> controllers -> services -> models -> MongoDB
  (main.js wires it up, server.js starts it)


================================================================
SECTION 1 — ARCHITECTURE & MVC
================================================================

Q: Explain the architecture of your project.
A: It follows a layered MVC-style approach:
   - routes/  : map each URL + HTTP method to a controller function.
   - controllers/: handle the HTTP request/response. Thin layer.
   - services/: contain the business logic (validation, referential
     checks, database rules).
   - models/  : define the Mongoose schemas (the data structure).
   This gives a clean separation of concerns: routes never touch the
   database, controllers hold no business logic, and services never
   send HTTP responses.

Q: Why separate services from controllers?
A: So controllers stay "thin" and just handle request/response, while
   reusable business logic lives in services. This avoids duplicating
   code, makes the logic unit-testable in isolation, and keeps each
   layer focused on one responsibility.

Q: Where does the Express app get created, and where does the server start?
A: main.js creates and configures the Express app — sets up express.json(),
   mounts the routers at their base paths (/users, /projects, /tasks,
   /auth), and exports the app. server.js is the entry point: it loads
   dotenv, connects to MongoDB (mongoose.connect), and then calls
   app.listen(PORT).


================================================================
SECTION 2 — MONGODB & MONGOOSE MODELS
================================================================

Q: What is a Mongoose schema, and why use it?
A: A schema is a blueprint that defines the structure of a MongoDB
   document: the fields, their types, and rules like required, unique,
   minlength, min. Mongoose enforces these rules, so bad/invalid data
   is rejected before it reaches the database. For example, on the User
   model, email is `unique` so you can't have two users with the same
   email.

Q: What does `select: false` on the password field do?
A: It means the password is NOT returned by default in queries. So when
   you fetch users, the password hash is hidden automatically for
   security. During login, we explicitly use `.select('+password')` to
   bring it back only so we can compare the typed password with the
   stored hash.

Q: How do the three collections relate to each other?
A: 
   - Project -> User: Project stores managerId, ownerId, createdBy,
     updatedBy. Each is an ObjectId referencing the User collection.
   - Task -> Project: Task stores projectId (references Project).
   - Task -> User: Task stores userId (references User).
   These are references (like foreign keys in SQL), not embedded
   documents.

Q: What does `ref: 'User'` / `ref: 'Project'` mean in the schema?
A: It tells Mongoose that the field holds an ObjectId which points to
   that other collection. This is what allows `.populate('...')` to
   fetch the related document and replace the ID with real data.


================================================================
SECTION 3 — REFERENTIAL VALIDATION
================================================================

Q: How do you make sure a Project's managerId points to a real user?
A: In projectService.js there is a helper called checkUsers(). It lists
   all user-reference fields (managerId, ownerId, createdBy, updatedBy),
   loops over them, and does User.findById(data[field]). If no user is
   found, it throws an error like "managerId user does not exist" and
   the request is rejected before creating/updating the project.

Q: How do you validate a Task's references?
A: In taskService.js, before creating a task:
   - projectId is checked with Project.findById; if missing, throw
     "Project does not exist".
   - userId is checked with User.findById; if missing, throw
     "User does not exist".
   The task is only created if BOTH exist. On update, we only re-check
   references that were actually changed in the request.

Q: Why is this validation important?
A: It maintains referential integrity. Without it, a Project could
   reference a deleted user, or a Task could belong to a non-existent
   project. This is the "referential validation" requirement — separate
   from basic format/required-field validation.

Q: Do you validate the ObjectId format too?
A: Yes. In the controllers, before any findBy/findByIdAndUpdate, I check
   `mongoose.isValidObjectId(req.params.id)`. If it's not a valid
   ObjectId, we return 400 "That is not a valid id". This avoids
   database cast errors.


================================================================
SECTION 4 — POPULATE (replacing IDs with real data)
================================================================

Q: How do you return full user info instead of just IDs?
A: Using Mongoose's .populate(). For example, getAllProjects does:
   Project.find()
     .populate('managerId')
     .populate('ownerId')
     .populate('createdBy')
     .populate('updatedBy');
   Populate performs an extra query on the referenced collection and
   replaces each stored ID with the actual document, so the response
   contains full user objects instead of raw IDs.

Q: What's the difference between what's stored and what's returned?
A: The database stores only the IDs. Populate only changes what the API
   returns — it fetches the referenced documents and swaps the IDs for
   the data. We did NOT change how data is stored, only how it's
   presented in responses.

Q: How do you avoid returning the password when populating?
A: The password field already has `select: false` in the User schema, so
   it is excluded by default even when the user is populated into a
   project or task response. Only the safe fields are exposed.

Q: Which operations return populated data?
A: All the read operations. For Project: getAllProjects and
   getProjectById use .populate() on all four user references. For Task:
   getAllTasks and getTaskById populate projectId and userId with their
   related documents.


================================================================
SECTION 5 — AUTHENTICATION (JWT + bcrypt)
================================================================

Q: How does registration work?
A: In authService.registerUser:
   1. Check if email already exists -> 400 if it does.
   2. Hash the plain password with bcrypt.hash(password, 10).
   3. Create the user storing the HASH, never the raw password.
   4. Return a signed JWT token.

Q: Why hash passwords with bcrypt?
A: Storing plain-text passwords is a huge security risk — if the database
   leaks, all passwords are exposed. bcrypt hashes them (one-way) with
   a salt, so even if the hash leaks, you can't recover the original
   password, and the salt prevents identical passwords from producing
   identical hashes.

Q: How does login work?
A: In authService.loginUser:
   1. Find the user by email with .select('+password') to reveal the hash.
   2. If not found -> 401.
   3. bcrypt.compare(typedPassword, storedHash) -> if mismatch -> 401.
   4. If it matches, sign and return a JWT.

Q: What is a JWT and what does it contain?
A: A JSON Web Token is a signed token proving the user is authenticated.
   We create it with jwt.sign({ userId: user._id }, SECRET_KEY, {expiresIn
   : '24h'}). It contains the user's id as payload, is signed with a secret
   key, and expires after 24 hours.

Q: How does the auth middleware protect routes?
A: authMiddleware reads the Authorization header, expects the "Bearer
   <token>" format, extracts the token, then jwt.verify(token,
   SECRET_KEY). If verification fails (invalid or expired), it returns
   401 and stops the request before it reaches the controller. If valid,
   it sets req.user = decoded and calls next() to continue.

Q: Why do the auth routes have no middleware?
A: Because register and login are public by design — you must be able to
   call them WITHOUT a token in order to GET a token. Every other route
   (users, projects, tasks) is protected by the auth middleware.


================================================================
SECTION 6 — CRUD & REST DESIGN
================================================================

Q: List the endpoints in your API.
A:
   Authentication:
     POST /auth/register
     POST /auth/login
   Users:
     POST   /users        (create)
     GET    /users        (list all)
     GET    /users/:id    (get one)
     PUT    /users/:id    (update)
     DELETE /users/:id    (delete)
   Projects:
     POST   /projects
     GET    /projects
     GET    /projects/:id
     PUT    /projects/:id
     DELETE /projects/:id
   Tasks:
     POST   /tasks
     GET    /tasks
     GET    /tasks/:id
     PUT    /tasks/:id
     DELETE /tasks/:id

Q: What HTTP status codes do you use?
A: 201 for created resources, 200 for successful reads/updates/deletes,
   400 for invalid input (bad id, validation failure, referential
   failure, duplicate email), 401 for missing/invalid token, 404 when a
   resource isn't found, 500 for database/server errors.

Q: Why PUT and not PATCH for updates?
A: I used PUT with full-document replacement semantics. It works with
   findByIdAndUpdate, which updates the fields provided. (Interviewers
   often just want to know you understand the difference — PUT replaces,
   PATCH partial-updates.)


================================================================
SECTION 7 — ERROR HANDLING
================================================================

Q: How do you handle errors in your controllers?
A: Every controller function is wrapped in try/catch. Inside the catch,
   it inspects the error: if it's a Mongoose ValidationError or a
   duplicate-key error (code 11000), it returns 400. For project/task
   controllers, it also checks if the message includes "does not exist"
   (referential failure) and returns 400. Otherwise it returns 500 with
   a "Database error" message.

Q: How do you handle a not-found resource?
A: After the service call returns, I check if the result is null/empty.
   If the document doesn't exist, the controller returns 404 with a
   message like "User not found".

Q: How would you improve error handling?
A: I could centralize it with a custom ApiError class and a single error-
   handling middleware (Express's 4-arg error handler), plus an async
   wrapper (asyncHandler) so I don't repeat try/catch in every
   controller. This is what the layered/improved version of the project
   does, and it reduces duplication and makes errors consistent.


================================================================
SECTION 8 — SQL vs NoSQL / GENERAL
================================================================

Q: Why MongoDB for this project?
A: The data is document-based, and the relationships are simple
   references that Mongoose handles well. MongoDB offers flexibility and
   fast development, and references between collections work through
   ObjectIds and populate.

Q: What is the difference between references and embedded documents?
A: References store only the ID of another document (as in this project);
   you populate to fetch the data. Embedded documents store the data
   directly inside the parent. References keep data DRY and avoid
   duplication; embedding is faster but duplicates data.

Q: What would you improve or add next?
A: 
   - Centralized error handling (ApiError + error middleware).
   - Input validation for request bodies (e.g. with express-validator).
   - Pagination, sorting and filtering on list endpoints.
   - Role-based access control (e.g. only a manager can update a project).
   - Env-specific config (dev/prod), logging, and automated tests.
   - Prevent deleting a user/project that is still referenced by others
     (or handle cascades).


================================================================
PRACTICE PITCH (30-second summary of the project)
================================================================
"This is a Project Management REST API built with Node.js, Express and
MongoDB via Mongoose. It manages three collections: Users, Projects and
Tasks, with proper references between them. It uses an MVC architecture
routing through controllers, services and models. It includes full CRUD
for all three entities, referential validation to make sure a project's
manager and a task's project actually exist, JWT-based authentication
with bcrypt hashed passwords, and it uses Mongoose populate so the API
returns the full related user and project data instead of just raw IDs."
