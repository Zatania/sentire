# Sentire System Testing Guide

## Quick Start Testing

### Test 1: Complete User Registration & Survey
1. Navigate to homepage `/`
2. Click "Student" role selector
3. Go to `/survey`
4. Fill in:
   - Full Name: Test Student
   - Email: test.student@pup.edu.ph
   - Program: DIT
   - Year Level: First Year
   - Complete all survey questions
5. Submit survey
6. **Expected**: Redirect to login with credentials displayed
7. **Login** with the email and password provided
8. **Expected**: Redirect to `/dashboard` (Student Wellness Dashboard)

### Test 2: Admin Login Flow
1. As Admin, login with admin credentials
2. **Expected**: Redirect to `/dashboard/admin` 
3. **Verify**: Admin dashboard loads with:
   - Sidebar (maroon background)
   - Wellness Index section
   - Survey Responses table
   - AI sentiment analysis (if responses exist)

### Test 3: Teacher Login Flow
1. As Teacher, login with teacher credentials
2. **Expected**: Redirect to `/dashboard/overview`
3. **Verify**: Teacher dashboard loads with:
   - Student list
   - Wellness metrics
   - Class sentiment overview

### Test 4: Student Dashboard
1. As Student, after login you should see:
   - Personal wellness dashboard
   - Quick action buttons (Complete Survey, View Progress)
   - Student name and email displayed
2. **Verify**: Can navigate to `/survey` to submit responses

## API Testing

### Test Admin Analytics API
```bash
curl -H "Authorization: Bearer <AUTH_TOKEN>" \
  https://your-app.com/api/wellness/analyze
```
**Expected Response**:
```json
{
  "sentiment": "Overall wellness sentiment analysis...",
  "responseCount": 5,
  "status": "success"
}
```

### Test Wellness Responses API
```bash
curl -H "Authorization: Bearer <AUTH_TOKEN>" \
  https://your-app.com/api/wellness/responses
```
**Expected Response**:
```json
{
  "responses": [
    {
      "id": "uuid",
      "category": "wellness",
      "score": 75,
      "feedback": "...",
      "submitted_at": "2026-04-07T..."
    }
  ]
}
```

## Database Verification

### Check Survey Responses Table
```sql
-- Should have all these columns
SELECT 
  id, 
  student_id, 
  user_id,
  program, 
  gender,
  q2_lonely_1, 
  q10_procrastinate_5, 
  q11_depressed_1,
  created_at
FROM survey_responses 
LIMIT 1;
```

### Check Profiles Table
```sql
-- Verify role field exists and is populated
SELECT id, full_name, email, role 
FROM profiles 
WHERE role IS NOT NULL 
LIMIT 5;
```

### Check RLS Policies
```sql
-- Verify Row Level Security is enforced
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies 
WHERE tablename IN ('profiles', 'survey_responses', 'student_survey_responses')
ORDER BY tablename;
```

## Common Issues & Solutions

### Issue: "Could not find the 'q10_procrastinate_5' column"
**Solution**: The SQL migration has been run. If still seeing this:
1. Go to Supabase SQL Editor
2. Run: `NOTIFY pgrst, 'reload schema'`
3. Wait 5 seconds and retry

### Issue: Redirect Loop Between `/dashboard` and `/survey`
**Solution**: Already fixed in middleware.ts and auth/actions.ts
- Middleware now allows dashboard access for authenticated users
- Server-side routing in dashboard/page.tsx handles role redirects
- No client-side routing conflicts

### Issue: "Admin access required" error on admin API
**Solution**: User must have a record in `profiles_admin` table
- Check user's role in `profiles` table
- Verify `profiles_admin` entry exists with matching `user_id`

### Issue: "Unauthorized" on wellness API endpoints
**Solution**: Ensure user is authenticated
- Check browser cookies for session
- Verify Supabase auth session is valid
- User must have completed survey (or be admin/teacher)

## Performance Checks

### Database Indexes
Verify indexes are created for common queries:
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('survey_responses', 'student_survey_responses', 'profiles')
ORDER BY indexname;
```

### API Response Time
- `/api/wellness/analyze` - Should be < 2s (depends on Groq API)
- `/api/wellness/responses` - Should be < 500ms
- Dashboard pages - Should load in < 1s

## Browser DevTools Checks

### Network Tab
- All API calls should return 200 (not 401, 403, 500)
- Images should load (logo, etc.)
- No CORS errors

### Console Tab
- No "auth.uid() function error" messages
- No "undefined is not an object" errors
- Groq API should be called for analytics (visible in Network)

### Application Tab
- Supabase session cookies present
- Local storage contains auth data

## Regression Tests

### After Each Deploy, Verify:
- [ ] New student can register and login
- [ ] Admin can view analytics dashboard
- [ ] Teacher can see student list
- [ ] Survey questions are persisted in database
- [ ] Logout clears session properly
- [ ] Role-based redirects work correctly
- [ ] All API endpoints return correct data
- [ ] No console errors during normal usage

## Load Testing Scenarios

### Scenario 1: Multiple Students Submitting Surveys
- 5-10 concurrent survey submissions
- Verify all inserts succeed without conflicts
- Check for race conditions

### Scenario 2: Admin Viewing Analytics
- With 100+ survey responses in database
- Admin analytics API should complete in < 5s
- Groq AI analysis should be returned

### Scenario 3: Teacher Filtering Students
- With 50+ students in system
- Filter and search should be responsive
- Dashboard should load < 2s

## Success Criteria

✅ **System is fully functional when:**
1. User registration through survey works without errors
2. All three roles (admin, teacher, student) can login
3. Role-based redirects work correctly (no loops)
4. Each dashboard displays appropriate data for role
5. API endpoints return correct data with proper auth
6. Survey responses are properly stored in database
7. No console errors during normal user workflows
8. Admin analytics (Groq AI) is generating insights
9. Row Level Security prevents unauthorized data access
10. Database schema includes all survey question columns

---

**Last Updated**: 2026-04-07
**System Status**: ✅ FULLY FUNCTIONAL
