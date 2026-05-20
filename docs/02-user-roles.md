# User Roles

## Homeowner

The current default role for new profiles. Homeowners can create homes, become owner members through `home_members`, add rooms/devices, view readings, respond to alerts, and create activity through app actions.

## Household Member

Supported in the domain model as `member`. Membership access is controlled by `home_members`; broader invitation/member management is planned.

## Admin/Demo Operator

Supported in the domain model as `administrator` and useful for demo/admin controls. Current permissions are primarily enforced through home membership and screen flow, not a full role matrix.

## Current Permissions

- Users can read their own profile.
- Users can create homes where `created_by` is their auth user id.
- Users can access home-owned data when they are a member of that home.
- Rooms, devices, readings, alerts, and activity logs are protected by home membership RLS policies.

## Planned Permissions

- Household invitations.
- Fine-grained owner/member/admin controls.
- Production operator roles for provisioning and support.

