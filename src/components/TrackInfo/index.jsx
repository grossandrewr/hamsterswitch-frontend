import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


const TrackInfo = ({ current_track}) => {
  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" style={{paddingTop: "35px"}}>
      <Typography variant="h5" style={{ fontWeight: "bold" }}>{current_track?.name}</Typography>
      <Typography variant="h6">{current_track?.album.name} • {current_track?.artists[0]?.name}</Typography>
    </Grid>
  )
}

export default TrackInfo
