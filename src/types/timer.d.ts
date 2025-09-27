interface Timer {
	id: number;
	duration: number;
	title: string;
}

interface CurrentTimer {
	id: number;
	remainingTime: number;
	totalTime: number;
	title: string;
}