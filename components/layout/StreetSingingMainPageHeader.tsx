import {
  AppBar,
  Box,
  Toolbar,
  List,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Stack,
  Button,
  Container,
  SxProps,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, KeyboardEvent } from 'react';
import TUIcon from './TUIcon';

type Props = { sx: SxProps };
const StreetSingingHeader = ({ sx }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerKeyEvent = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(prev => !prev);
  };

  const handleDrawerClick = () => {
    setDrawerOpen(prev => !prev);
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="sticky" color="inherit" sx={sx}>
      <Container maxWidth="xl">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button startIcon={<TUIcon />} color="inherit" size="large">
            Straßensingen
          </Button>
          {matches ? (
            <Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerClick}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClick}
              >
                <Box
                  sx={{ width: 250 }}
                  role="presentation"
                  onKeyDown={handleDrawerKeyEvent}
                >
                  <List>{/* If there were links they would be here */}</List>
                </Box>
              </Drawer>
            </Box>
          ) : (
            <Stack direction="row" spacing={2}>
              {/* If there were links or a login/logout button, they would be here */}
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default StreetSingingHeader;
