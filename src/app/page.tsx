import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AccountDesk } from "@/components/AccountDesk";
import { CursteroidsGame } from "@/components/CursteroidsGame";
import { ResumeFeedback } from "@/components/ResumeFeedback";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import {
  CHALLENGE_BRIEF,
  CHALLENGE_RUBRIC,
  CHALLENGE_TITLE,
  CAREERS_URL,
  RECRUITER_EVAL_NOTE,
  REPO_URL,
} from "@/game/challenge";
import { APPLY_WITH_CHALLENGE_HINT } from "@/game/constants";
import { AI_ADOPTION_ENGINEER_ROLE } from "@/game/roles/ai-adoption-engineer";

function CursteroidsLogo() {
  return (
    <Box
      component="svg"
      aria-label="Cursteroids logo"
      viewBox="0 0 32 32"
      sx={{ width: 30, height: 30, flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logoShell" x1="4" x2="28" y1="6" y2="27">
          <stop stopColor="#55554f" />
          <stop offset="0.52" stopColor="#191916" />
          <stop offset="1" stopColor="#77776f" />
        </linearGradient>
        <linearGradient id="logoPlane" x1="7" x2="26" y1="9" y2="26">
          <stop stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f4f4f3" />
          <stop offset="1" stopColor="#c8c8c5" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.35c.66 0 1.3.17 1.88.5l9.34 5.39A3.76 3.76 0 0 1 29.1 11.5v9a3.76 3.76 0 0 1-1.88 3.26l-9.34 5.39a3.76 3.76 0 0 1-3.76 0l-9.34-5.39A3.76 3.76 0 0 1 2.9 20.5v-9c0-1.34.72-2.59 1.88-3.26l9.34-5.39c.58-.33 1.22-.5 1.88-.5Z"
        fill="url(#logoShell)"
      />
      <path d="m16 2.8 11.95 6.9H16Z" fill="#171713" opacity="0.72" />
      <path d="M3.25 20.55V11.3L16 9.7v19.55Z" fill="#5c5c55" opacity="0.6" />
      <path d="M28.75 20.55V11.3L16 9.7v19.55Z" fill="#12120f" opacity="0.45" />
      <path
        d="M7.02 10.06h17.96c.83 0 1.24.99.65 1.57L16.5 27.04c-.45.76-1.62.44-1.62-.45v-9.82L6.48 11.7c-.78-.47-.37-1.64.54-1.64Z"
        fill="url(#logoPlane)"
      />
      <path
        d="m15.05 16.75 10.58-6.08-9.13 16.37c-.45.76-1.62.44-1.62-.45v-9.82l.17-.02Z"
        fill="#d5d5d2"
        opacity="0.8"
      />
    </Box>
  );
}

export default function Home() {
  const role = AI_ADOPTION_ENGINEER_ROLE;

  return (
    <Box component="main" sx={{ minHeight: "100vh", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2.5}>
          {/* Slim header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <CursteroidsLogo />
              <Stack spacing={0}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  Cursteroids
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  The job description you can play
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}
            >
              <Button size="small" variant="text" href="#account-desk">
                Judgment mode
              </Button>
              <Button size="small" variant="text" href="#resume-feedback">
                Fit check
              </Button>
              <Button size="small" variant="text" href="#artifact-challenge">
                Artifact challenge
              </Button>
              <Button
                size="small"
                variant="contained"
                href={CAREERS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply
              </Button>
              <ThemeModeToggle />
            </Stack>
          </Stack>

          {/* Hero: the game IS the pitch */}
          <Stack spacing={1}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.5rem", md: "2.1rem" },
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              We&apos;re hiring an {role.title}.
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {" "}
                This is the job, playable.
              </Box>
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              Clear the adoption blockers real engineering orgs throw at you. Accept the Tab
              suggestions. Deploy agents on the toil. Keep Trust alive. If ninety seconds of this
              feels like your day job — good. {role.whoThrivesCta}
            </Typography>
          </Stack>

          <CursteroidsGame />

          {/* Judgment mode + role intel */}
          <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper
                id="account-desk"
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                  scrollMarginTop: 24,
                  height: "100%",
                }}
              >
                <AccountDesk />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <AutoAwesomeRoundedIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      The actual job
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">{role.oneLiner}</Typography>
                  {role.about.split("\n\n").slice(0, 3).map((paragraph) => (
                    <Typography key={paragraph.slice(0, 40)} color="text.secondary">
                      {paragraph}
                    </Typography>
                  ))}
                  <Stack spacing={1}>
                    {role.roleLoop.map((phase) => (
                      <Stack
                        key={phase.id}
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "baseline" }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 88 }}>
                          {phase.label}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {phase.title} — {phase.detail}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* What you build */}
          <Paper
            id="what-you-build"
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              scrollMarginTop: 24,
            }}
          >
            <Stack spacing={2}>
              <Stack spacing={0.75}>
                <Typography variant="overline" color="text.secondary">
                  A strong quarter of output
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  What you build
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
                  The powerups in the game are the deliverables in the job. Events are optional.
                  Systems other teams can reuse are the work.
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                {role.artifacts.map((artifact) => (
                  <Grid key={artifact.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Stack
                      spacing={0.5}
                      sx={{
                        p: 2,
                        height: "100%",
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {artifact.label}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {artifact.detail}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>

          {/* Fit check */}
          <Paper
            id="resume-feedback"
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              scrollMarginTop: 24,
            }}
          >
            <ResumeFeedback />
          </Paper>

          {/* The real filter */}
          <Paper
            id="artifact-challenge"
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              scrollMarginTop: 24,
            }}
          >
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  The real filter
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {CHALLENGE_TITLE}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
                  You&apos;ve seen the job. Now do one rep of it. {CHALLENGE_BRIEF}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1.25}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Rubric
                    </Typography>
                    {CHALLENGE_RUBRIC.map((item) => (
                      <Stack
                        key={item.label}
                        spacing={0.25}
                        sx={{ py: 1, borderBottom: 1, borderColor: "divider" }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {item.detail}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Where to start
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Fork the repo. There&apos;s a <code>.cursorrules</code> at the root written
                        as a model leave-behind artifact — study it, then ship your own: a Rules
                        snippet, prompt architecture, MCP sketch, workflow guide, dashboard brief,
                        Cloud Agent workflow, or enablement guide grounded in a real stack.
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Open a PR, or record a short Loom plus a written note on why the team would
                        own it after you leave.
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ alignItems: { sm: "center" }, flexWrap: "wrap" }}
              >
                <Button
                  variant="contained"
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fork and open a PR
                </Button>
                <Button
                  variant="outlined"
                  href={CAREERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply with your PR or Loom
                </Button>
                <Typography color="text.secondary" variant="caption">
                  {APPLY_WITH_CHALLENGE_HINT}
                </Typography>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: "divider",
                  background: "background.default",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>
                  For recruiters and hiring managers
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {RECRUITER_EVAL_NOTE}
                </Typography>
              </Paper>

              <Typography color="text.secondary" variant="body2">
                {role.whoThrives.join(" ")} {role.whoThrivesCta}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
