export const parseStravaActivity = (stravaActivity: any) => ({
  name: stravaActivity.name,
  date: new Date(stravaActivity.start_date).toISOString().split("T")[0],
  duration: stravaActivity.elapsed_time, // seconds
  distance: stravaActivity.distance, // meters
  elevGain: stravaActivity.total_elevation_gain ?? 0,
  elevLoss: stravaActivity.total_elevation_gain ?? 0, // Strava doesn't provide elev loss
  maxSpeed: (stravaActivity.max_speed ?? 0) * 3.6, // m/s → km/h
  maxSlope: 0, // not available from Strava summary
});
