---
description: Standard Deployment Workflow for MineBox
---

This workflow ensures safe synchronization between the UAT (staging) and Main (production) branches.

1. **Commit and Push to UAT**
   - Ensure you are on the `uat` branch locally.
   - Run: `git add .`
   - Run: `git commit -m "feat: [description]"`
   - Run: `git push new-origin uat`

2. **Verify UAT**
   - Confirm the Netlify/Vercel build for the UAT branch is successful.
   - (Manual) User verifies the features on the UAT URL.

3. **Merge to Production**
   - Switch to the main branch: `git checkout main`
   - Pull latest: `git pull new-origin main` (optional but safe)
   - Merge UAT: `git merge uat`
   - Push to Production: `git push new-origin main`

4. **Verify Production**
   - Confirm the Production build is successful.
   - (Manual) User verifies the features on the Live URL.

5. **Return to Workspace**
   - Switch back to UAT: `git checkout uat`
   - Now the workspace is ready for the next set of changes without risk to the main branch.
