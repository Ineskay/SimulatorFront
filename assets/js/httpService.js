function changeParameters() {
    const formData = {
        'n_cranes': document.getElementById('n_cranes').value,
        'seed': document.getElementById('seed').value,
        'alpha_A': document.getElementById('alpha_A').value,
        'beta_A': document.getElementById('beta_A').value,
        'mean_PG': document.getElementById('mean_PG').value,
        'sigma_PG': document.getElementById('sigma_PG').value,
        'mean_MG': document.getElementById('mean_MG').value,
        'sigma_MG': document.getElementById('sigma_MG').value,
        'mean_S': document.getElementById('mean_S').value,
        'sigma_S': document.getElementById('sigma_S').value
    };
    window.localStorage.setItem('formData', JSON.stringify(formData));
    console.log(formData);
    $.ajax({
        url: 'http://localhost:5000/post',
        method: 'POST',
        success: function (response) {
            window.localStorage.setItem('simulation_id', response['simulation_id'])
        },
        data: JSON.stringify(formData),
        dataType: 'json',
    });
}

function fillParameters() {
    const formData = window.localStorage.getItem('formData');
    if(formData !== null){
        const values = JSON.parse(formData);
        document.getElementById('n_cranes').value = values['n_cranes'];
        document.getElementById('seed').value = values['seed'];
        document.getElementById('alpha_A').value = values['alpha_A'];
        document.getElementById('beta_A').value = values['beta_A'];
        document.getElementById('mean_PG').value = values['mean_PG'];
        document.getElementById('sigma_PG').value = values['sigma_PG'];
        document.getElementById('mean_MG').value = values['mean_MG'];
        document.getElementById('sigma_MG').value = values['sigma_MG'];
        document.getElementById('mean_S').value = values['mean_S'];
        document.getElementById('sigma_S').value = values['sigma_S'];
    }
}

function getResults() {
    let id = window.localStorage.getItem('simulation_id');
    if (id === null) {
        changeParameters();
        while(id === null) id = window.localStorage.getItem('simulation_id');
    } else {
        $.ajax({
            url: `http://localhost:5000/results/${id}`,
            method: 'GET',
            success: function (response) {
                console.log(response);

                document.getElementById('mean_time').innerText = response['mean_time'] + 's';
                document.getElementById('queue_percentage').innerText = response['queue_percentage'] + '%';
                document.getElementById('max_time').innerText = response['max_time'] + 's';

                ctx = document.getElementById('chartHours').getContext("2d");
                matrix = response['queue_matrix'];
                matrix = aggregate(matrix);

                datasets = [];
                for (let i = 0; i < matrix.size(); ++i) {
                    datasets.add({
                        borderColor: getColor(i),
                        backgroundColor: getColor(i),
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        borderWidth: 3,
                        data: matrix[i]
                    });
                }

                myChart = new Chart(ctx, {
                    type: 'line',

                    data: {
                        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", " 13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
                        datasets: datasets
                    },
                    options: {
                        legend: {
                            display: false
                        },

                        tooltips: {
                            enabled: false
                        },

                        scales: {
                            yAxes: [{

                                ticks: {
                                    fontColor: "#9f9f9f",
                                    beginAtZero: false,
                                    maxTicksLimit: 5,
                                    //padding: 20
                                },
                                gridLines: {
                                    drawBorder: false,
                                    zeroLineColor: "#ccc",
                                    color: 'rgba(255,255,255,0.05)'
                                }

                            }],

                            xAxes: [{
                                barPercentage: 1.6,
                                gridLines: {
                                    drawBorder: false,
                                    color: 'rgba(255,255,255,0.1)',
                                    zeroLineColor: "transparent",
                                    display: false,
                                },
                                ticks: {
                                    padding: 20,
                                    fontColor: "#9f9f9f"
                                }
                            }]
                        },
                    }
                });
            },
            dataType: 'json',
        });
    }
}

function aggregate(matrix) {
    for (let i = 1; i < matrix.size(); ++i) {
        for (let j = 0; j < 24; ++j) {
            matrix[i][j] += matrix[i - 1][j];
        }
    }
    return matrix;
}

function getColor(i) {
    switch (i % 4) {
        case 0:
            return "#6bd098";
        case 1:
            return "#f17e5d";
        case 2:
            return "#fcc468";
        case 3:
            return "#51CBCE";
    }
}

