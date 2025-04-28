# Nonprofit Explorer Frontend (React + Tailwind + Vite)

## Layout Plan

### Query Section (Top Center)
- Textarea/input for user query
- Submit button
- Loading spinner while waiting for `/query/` response

### Response Section (Main Center)
- If error: formatted JSON error output
- If success: data table
  - Scrollable (horizontally if needed)
  - Pagination (10–20 rows per page)
  - Download CSV button
  - Clear Table button (optional)

### Sidebar (Right or Left Panel)
- Recent Queries
  - Fetch recent 5 queries from `/recent/`
  - Auto-refresh after successful `/query/`
  - Each recent query is clickable (triggers `/rerun_submission/<submission_id>/`)
- Columns Info
  - Display all available columns and descriptions (scrollable div or pop-up modal)

### Other Features
- Loading indicators for all API calls
- Error handling (show API errors nicely)
- Use Axios or Fetch API for backend communication
- Light background, soft card UI, hover effects

### Backend API Endpoints Used
- `POST /query/`
- `GET /recent/`
- `GET /rerun_submission/<submission_id>/`

### Auto-refresh Recent Queries
- After a successful POST to `/query/`, immediately call GET `/recent/` again and update the recent queries list automatically.

---

## Next Steps
1. `npm create vite@latest frontend_app -- --template react`
2. Install Tailwind CSS and dependencies
3. Implement the above layout in React components
4. Connect to backend endpoints
