# ShopEasy Lite

A dependency-free Node.js application for the DevOps lab. The page lists three products, adds items to a cart and calculates totals on the server using integer paise. `GET /health` reports the application version. No database or payment service is involved.

## Requirements

Node.js 22 or 24; npm for the convenience scripts. Docker Engine is required for container commands. A GitHub repository with Actions enabled, package publishing access and repository administration access is required for the hosted CI and branch-protection exercises.

## Run locally

```powershell
npm run lint
npm test
npm run package
npm start
```

Open `http://localhost:3000`. The project has no third-party dependencies, so there is no dependency installation step. Lint checks JavaScript syntax, whitespace and final newlines; the test suite checks cart calculations, validation and HTTP routes. Packaging copies only runtime files to `dist/shopeasy-lite` and writes a manifest.

## Lab 5 custom Docker image

```powershell
docker build --build-arg APP_VERSION=1.0.0 -t shopeasy-lite:1.0.0 .
docker run -d --name shopeasy-v1 -p 127.0.0.1:3000:3000 shopeasy-lite:1.0.0
Invoke-RestMethod http://localhost:3000/health
docker inspect --format '{{.State.Health.Status}}' shopeasy-v1
docker logs shopeasy-v1
```

The first Docker stage lints, tests and packages the application. The second stage copies only the packaged runtime files, runs as the `node` user, exposes port 3000 and checks the health endpoint. A successful Docker build also confirms the checks inside the image build stage. These commands are instructions; actual local execution is recorded separately by the lab runner.

## Lab 6 continuous integration and main protection

`.github/workflows/ci.yml` runs on every push and pull request. Its matrix runs the same lint, seven tests and packaging steps on Node.js 22 and 24. Each matrix job uploads a separate artifact. Action implementations are pinned to full commit hashes; the token has only read access to repository contents.

After the first successful hosted run, open repository Settings, Branches, add a protection rule for `main`, and require a pull request, the two status checks `Node 22 lint test package` and `Node 24 lint test package`, and an up-to-date branch. Enable enforcement for administrators or disable bypasses. If review is required, use a second collaborator to approve it; authors cannot approve their own pull requests. Protection is a GitHub setting and is not established by committing the workflow file.

To demonstrate the merge gate, make a temporary branch, deliberately change the cart test's expected `22000` to `1`, commit and push, and open a pull request. Verify both hosted checks fail and GitHub blocks merging. Correct the expectation, push another commit and verify both checks pass. Capture the failed checks, blocked merge and restored successful checks as separate evidence. Do not merge the deliberately broken test.

## Lab 7 publish and roll back an exact image

`.github/workflows/publish.yml` runs when `main` changes or a `vMAJOR.MINOR.PATCH` tag is pushed. The image build repeats lint and tests before publication. GHCR login uses the job's `GITHUB_TOKEN`; only that job receives `packages: write`. The image name uses the lowercase repository path. Each image receives a full-commit tag `sha-<40-character-commit>` and tagged releases also receive their semantic version. The job summary records `ghcr.io/owner/repository@sha256:<digest>`.

Use the actual image name and digest from a successful hosted workflow, rather than the placeholders below:

```powershell
$image = 'ghcr.io/OWNER/REPOSITORY'
$newDigest = 'sha256:ACTUAL_NEW_IMAGE_DIGEST'
$oldDigest = 'sha256:ACTUAL_PREVIOUS_IMAGE_DIGEST'
docker pull "$image@$newDigest"
docker run -d --name shopeasy-new -p 127.0.0.1:3001:3000 "$image@$newDigest"
Invoke-RestMethod http://localhost:3001/health
docker inspect --format '{{.Image}}' shopeasy-new
docker pull "$image@$oldDigest"
docker run -d --name shopeasy-rollback -p 127.0.0.1:3002:3000 "$image@$oldDigest"
Invoke-RestMethod http://localhost:3002/health
docker inspect --format '{{.Image}}' shopeasy-rollback
```

For a private package, authenticate the local Docker client with an account token that can read the package, using `docker login ghcr.io --password-stdin`; do not put tokens into screenshots or source files. Running two loopback ports allows version comparison without deleting the current container. Using the digest selects the exact immutable content; a SHA-based tag is a traceability label and can technically be reassigned by a later publisher.

A local image build and local rollback do not prove publication, a GHCR pull or a hosted workflow run. Preserve the hosted run URL, published digest, registry pull output and health responses to prove the full remote cycle.

## Primary references checked on 2 November 2026

- GitHub Actions Node setup: https://github.com/actions/setup-node
- CI artifacts: https://github.com/actions/upload-artifact
- GitHub container publication: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- Package workflow permissions: https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions
- Required checks and reviews: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Docker build and publish action: https://github.com/docker/build-push-action
- Docker registry login: https://github.com/docker/login-action
- Buildx setup: https://github.com/docker/setup-buildx-action

## Verify the cart

Add two notebooks and three pens. The server should return 22000 paise and the page should show a total of INR 220.00. Clear the cart and verify the total returns to zero.
