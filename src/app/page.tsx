import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CursteroidsGame } from "@/components/CursteroidsGame";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";

export default function Home() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box
                component="svg"
                aria-label="Cursteroids logo"
                viewBox="0 0 32 32"
                sx={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                }}
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
              <Stack spacing={0}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  Cursteroids
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Cursor-style asteroid defense
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}
            >
              <Chip color="primary" label="Mode aware" size="small" />
              <Chip
                label="Keyboard first"
                variant="outlined"
                size="small"
              />
              <ThemeModeToggle />
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              background: "background.paper",
            }}
          >
            <Stack spacing={1.5}>
              <Typography color="text.secondary" variant="caption">
                Select repository / cursteroids
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1.35rem", md: "1.75rem" },
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                }}
              >
                Ask Cursor to dodge, shoot, and clear the asteroid field.
              </Typography>
            </Stack>
          </Paper>

          <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
            <Grid size={{ xs: 12, lg: 9 }}>
              <CursteroidsGame />
            </Grid>

            <Grid size={{ xs: 12, lg: 3 }}>
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    background: "background.paper",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <AutoAwesomeRoundedIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Mission Brief
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary">
                      Break asteroids into smaller fragments, preserve your
                      lives, and chain waves for a higher score. Your ship wraps
                      around the field, so use the edges like shortcuts.
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    background: "background.paper",
                    flexGrow: 1,
                  }}
                >
                  <Stack spacing={1.25}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Controls
                    </Typography>
                    {[
                      ["Rotate", "Arrow Left / Right or A / D"],
                      ["Thrust", "Arrow Up or W"],
                      ["Fire", "Space"],
                      ["Pause", "P"],
                      ["Restart", "Enter or Restart button"],
                    ].map(([label, value]) => (
                      <Stack
                        key={label}
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          py: 0.75,
                          borderBottom: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography color="text.secondary" variant="body2">
                          {label}
                        </Typography>
                        <Typography sx={{ textAlign: "right", fontWeight: 800 }} variant="body2">
                          {value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
