# Requirements Audit

Last checked: 2026-04-01

## Largely Implemented

- Multi-step participation/application flow with standards notice and role-based forms.
- Admin membership review flow with pending / approved / rejected states.
- Registration pending state, blocked login before approval, and thank-you page.
- Admin applications list plus dedicated application detail page.
- Approved-members-only user management area.
- Google sign-in button styling improved and linked into auth pages.
- Uploaded file previews on the apply flow, plus openable file links on the admin application detail page for newly submitted inline-preview documents.

## Partially Implemented

- Role-specific application forms exist, but the full `requirements.txt` field matrix is not completely covered for every membership type.
- Tier-based dashboard and access logic exist in parts, but the dashboards are not yet fully split into all required role-specific experiences.
- Community/forum features exist in [CollectivePage.tsx](./src/pages/CollectivePage.tsx), but they still use client-side/mock-style behavior rather than a complete production data model.
- Delete-profile flows exist in [AccountManagementPage.tsx](./src/pages/AccountManagementPage.tsx) and [MyProfilePage.tsx](./src/pages/MyProfilePage.tsx), but they are not yet fully wired to every required post-hire / no-hire requirement from the spec.

## Still Missing or Not Fully Matched

### Application / Membership Flow

- The spec says: application first, admin approval second, payment/membership selection after approval.
- The current implementation still collects plan/payment choices during the initial application flow, so this does not fully match the requirement.

### Resume Auto-Fill

- Resume upload exists, but PDF resume parsing and automatic field population are not implemented.

### Personality Test Integration

- The 16 personalities API integration from the requirements is not implemented.

### Booking / Interview Workflow

- Public-profile booking UI exists, but persistence is incomplete.
- [ProfilePage.tsx](./src/pages/ProfilePage.tsx#L608) still has `TODO: Save review to database`.
- [ProfilePage.tsx](./src/pages/ProfilePage.tsx#L715) still has `TODO: Save booking request to database`.

### Private Correspondence Page Removal

- The requirements say to delete Private Correspondence.
- Routes still exist in [App.tsx](./src/App.tsx#L77) and [App.tsx](./src/App.tsx#L78).

### Post Job / Service Request Redirect Rules

- The requirements say unauthenticated users should be redirected to Apply when creating job postings or service requests.
- Service request creation is still modal-based in [ServiceRequestsPage.tsx](./src/pages/ServiceRequestsPage.tsx#L371), so this rule is not yet fully enforced there.

### Add-On Purchases

- Add-on definitions and some checkout UI exist, but persistent add-on purchase management from the dashboard is not complete across all member types.

### Role-Specific Dashboards

- The dashboards are not yet fully separated into the exact Professional / Service Provider / Agency / Estate dashboard feature sets required in `requirements.txt`.

### Search / Featured / Visibility Rules

- Search and visibility exist, but the exact role/tier restrictions, featured placements, top-5 priority slot logic, hidden-field behavior, and per-plan limits are not fully implemented end-to-end.

### Forums / Community Restrictions

- The requirements specify city-locked community access tied to the user profile and one-forum-per-city creation rules.
- Some UI logic exists, but this still needs durable backend enforcement.

### Payment / Downgrade / Upgrade Lifecycle

- Downgrade handling exists in parts, but the full accepted-then-pay flow, downgrade options, and ongoing plan lifecycle management are not fully aligned to the requirements.

## Recommended Next Implementation Order

1. Refactor the membership flow so approval happens before paid plan checkout.
2. Finish booking / interview persistence and calendar workflow.
3. Remove or replace the old messaging/private correspondence routes.
4. Enforce auth redirects on job posting and service request creation.
5. Split dashboards and feature access by role and tier more strictly.
6. Implement add-on purchasing and persistence from the dashboard.
7. Add resume parsing and optional personality-test integration.
