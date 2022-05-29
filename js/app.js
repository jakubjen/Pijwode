class App {

	constructor() {
		this.waterConsumption = {};
		let themeName = window.localStorage.getItem('theme') || 'main';
		this.setTheme(themeName);

		try {
			this.waterConsumption = JSON.parse(window.localStorage.getItem('waterConsumption')) || {};
		}	catch(e){
			this.waterConsumption = {};
		}

		if('serviceWorker' in navigator){
		  navigator.serviceWorker.register('/sw.js')
		    .then(reg => console.log('service worker registered', reg))
		    .catch(err => console.log('service worker not registered', err));
		}

		this.chart = new ChartUtilities(this.waterConsumption);

		this.render();
	}

	showAddWaterPanel(e) {
		e.preventDefault();
		const addWaterPanel = document.querySelector('.addWaterPanel');
		const blueBackground = document.querySelector('.blueBackground');

		blueBackground.classList.add('show');
		addWaterPanel.classList.add('show')
	}

	showSettings() {
		const settings = document.querySelector('.settings');
		const blueBackground = document.querySelector('.blueBackground');

		settings.classList.add('show');
		blueBackground.classList.add('show');
	}

	closeWindows(e) {
		e.preventDefault();
		const addWaterPanel = document.querySelector('.addWaterPanel');
		const settings = document.querySelector('.settings');
		const blueBackground = document.querySelector('.blueBackground');

		addWaterPanel.classList.remove('show');
		settings.classList.remove('show');
		blueBackground.classList.remove('show');
	}

	deleteData(e) {
		e.preventDefault();
		if(confirm("Czy chesz usunąć dane z aplikacji?")){
			window.localStorage.clear();
			location.reload();
		}
	}

	addWater(e, value) {
		e.preventDefault();
		let date = new Date;
		date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

		let currentValue = this.waterConsumption[date] || 0;
		this.waterConsumption[date] =  currentValue + value;
		window.localStorage.setItem('waterConsumption', JSON.stringify(this.waterConsumption));

		const addWaterPanel = document.querySelector('.addWaterPanel');
		const blueBackground = document.querySelector('.blueBackground');
		addWaterPanel.classList.remove('show');
		blueBackground.classList.remove('show');

		this.render();
		this.chart.render();
	}

	formSubmit(e){
		let value = parseInt(document.querySelector("#capacity").value)||0;
		this.addWater(e, value)
	}

	setTheme(name) {
		const allowThemes = ['main', 'dark']
		if(!allowThemes.includes(name)){
			return -1;
		}

		localStorage.setItem('theme', name);
		const darkModeCheckbox = document.querySelector('.darkMode input');
		darkModeCheckbox.checked = (name === 'dark');

		if(name === 'main'){
			const link = document.querySelector('link#additionalCss');
			if(link != null){
				link.remove();
			}
			return 0
		}

		const head = document.querySelector('head');
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = `css/${name}.css`;
		link.id = 'additionalCss';

		head.appendChild(link);
		return 1;

	}

	render() {
		let date = new Date;
		date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

		let max = 0;
		for (const item in this.waterConsumption){
			max = (max<this.waterConsumption[item])? this.waterConsumption[item]:max;
		};

		let min = this.waterConsumption[Object.keys(this.waterConsumption)[0]] || 0;
		for (const item in this.waterConsumption){
			min = (min>this.waterConsumption[item])? this.waterConsumption[item]:min;
		};

		let sum = 0;
		for (const item in this.waterConsumption){
			sum += this.waterConsumption[item];
		};

		const avg = Math.round(sum / (Object.keys(this.waterConsumption).length||1));

		document.querySelector('.waterSum').innerText = (this.waterConsumption[date] || 0) + ' ml';
		document.querySelector('.tailMax .value').innerText = `${max} ml`;
		document.querySelector('.tailMin .value').innerText = `${min} ml`;
		document.querySelector('.tailAvg .value').innerText = `${avg} ml`;

	}
}

class ChartUtilities {
	constructor(waterConsumption) {
		this.page = new Date();

		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		this.recordPerPage = (vw>900)?10:4;

		const ctx = document.getElementById('myChart').getContext('2d');
		this.chart = new Chart(ctx, {
		    type: 'bar',
			responsive: true,
		    maintainAspectRatio: true,

		    data: {
		        labels: ['20.01', '21.01', '22.01', '23.01'],
		        datasets: [{
		            label: 'Water consumption',
		            backgroundColor: '#74b2d1',
		            borderColor: '#1055a0',
		            data: [1, 2.3, 1.4, 1.8]
		        }]
		    },

		    options: {
					tooltips: {
						enabled: false
					},

			legend: {
						display: false,
					},

					scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero: true
		                }
		            }]
		        }
				}
		});
		this.waterConsumption = waterConsumption;
		this.render();
	}

	render(){
		let days = [];
		let date = new Date(this.page);
		for(let i=0; i<this.recordPerPage; i++){
			days.unshift(new Date(date));
			date.setDate(date.getDate()-1);
		}
		let labels = [];
		let data = []
		for(const day of days){
			const month = (day.getMonth()+1 < 9)?'0'+(day.getMonth()+1):day.getMonth()+1;
			labels.push(`${day.getDate()}.${month}`);

			let index = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
			data.push(this.waterConsumption[index]/1000||0);
		}
		this.chart.data.labels = labels;
		this.chart.data.datasets[0].data = data;
		this.chart.update();
	}

	previous(){
		this.page.setDate(this.page.getDate()-this.recordPerPage);
		this.render();
	}

	next(){
		this.page.setDate(this.page.getDate()+this.recordPerPage);
		if(this.page > new Date) {
			this.page = new Date;
		}
		this.render();
	}

}

const app = new App();

window.addEventListener('resize', function(event){
	const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	app.chart.recordPerPage = (vw>768)?6:4;
	app.chart.render();
});
