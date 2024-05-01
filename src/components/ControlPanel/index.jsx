import Grid from '@mui/material/Grid';

import PlayButtons from "../PlayButtons"
import Navbar from "../Navbar"

const ControlPanel = ({ player, is_paused, currentScreen, setCurrentScreen }) => {
  return (
    <Grid 
      container 
      width="40%" 
      direction="row"
      alignItems="center"
      justifyContent="center"
      style={{ 
        marginTop: "50px",
        minWidth: "700px"
      }}
    >
      <PlayButtons 
        player={player} 
        is_paused={is_paused} 
      />
      <Navbar 
        currentScreen={currentScreen} 
        setCurrentScreen={setCurrentScreen} 
      />
    </Grid>
  )
}

export default ControlPanel
