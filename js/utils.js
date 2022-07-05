// Convert time in milliseconds to ticks
function ms_to_tick (ts_ms, tps) {
	return Math.floor(tps * ts_ms / 1000.);
}

function tick_to_beat (tick, tpb) {
	return tick/tpb;
}

function beat_to_ms(beat, bpm) {
	return (beat/bpm) * 60. * 1000.;
}