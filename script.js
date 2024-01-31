document.getElementById('fileInput').addEventListener('change', handleFileSelect);


function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            var visibilityElements = document.getElementsByClassName('visibility');
            for (var i = 0; i < visibilityElements.length; i++) {
                visibilityElements[i].style.display = 'block';
            }
            const content = e.target.result;
            const regex = /\[(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}:\d{2})\] ([^:]+):([\s\S]+?)(?=\n\[|$)/g;

            const database = [];
            let match;

            while ((match = regex.exec(content)) !== null) {
                const [, date, time, user, message] = match;
                database.push([date, time, user, message.trim()]);
            }
            
            const msgCountUser = countMessagesPerUser(database);
            const wordCountUser = countWordsPerUser(database);
            const totalWords = countWordsTotal(database);
            const longestSentence = returnLongestSentenceWords(database);
            const longestSentenceTop = longestSentence[0]
            const longestSentenceUser = longestSentenceTop[0];
            const longestSentenceLength = longestSentenceTop[1]['length'];
            const longestSentenceMsg = longestSentenceTop[1]['message'];
            const avgSentenceLength = returnAvgLenSentences(database);
            const msgCountPerDay = countMsgsPerDay(database);
            const wordCountPerDay = countWordsPerDay(database);
            const busiestDayDate = msgCountPerDay[0][0];
            const busiestDayMsgs = msgCountPerDay[0][1];
            const totalMsgs = countMsgsTotal(database)

            let busiestDayMsgTop = ""
            let busiestDayWordTop = ""

            for (let i = 0; i < 3; i++) {
                busiestDayMsgTop = busiestDayMsgTop + returnEmoji(i) + " " + msgCountPerDay[i][0] + ": " + msgCountPerDay[i][1] + " messages" + "<br>";
                busiestDayWordTop = busiestDayWordTop + returnEmoji(i) + " " + wordCountPerDay[i][0] + ": " + wordCountPerDay[i][1] + " words" + "<br>";
            }

            document.getElementById('msgs-total').textContent = totalMsgs;
            document.getElementById('words-total').textContent = totalWords;
            document.getElementById('avg-len-sentences').textContent = avgSentenceLength;
            document.getElementById('longest-sentence-user').textContent = longestSentenceUser;
            document.getElementById('longest-sentence-length').textContent = longestSentenceLength;
            document.getElementById('longest-sentence-msg').textContent = longestSentenceMsg;
            document.getElementById('top-3-msgs').innerHTML = busiestDayMsgTop;
            document.getElementById('top-3-words').innerHTML = busiestDayWordTop;
            
            drawChart(msgCountUser, 'msgCountPerUser', 'Messages sent per user', 'bar');
            drawChart(wordCountUser, 'wordCountPerUser', 'Words sent per user', 'bar');

            const numberOfUsers = msgCountUser.length;
            console.log(numberOfUsers);
        };
        
        reader.readAsText(file);
    } else {
        alert('Please select a file.');
    }
};


function countMessagesPerUser(chatData) {
    const userEntries = [];
    const userFreq = {};

    for (const entry of chatData) {
        const user = entry[2];
        userEntries.push(user);
    }

    for (const user of userEntries) {
        userFreq[user] = (userFreq[user] || 0) + 1;
    }

    const sortedUserFreq = Object.entries(userFreq).sort ((a, b) => b[1] - a[1]);

    return sortedUserFreq;
}


function countWordsPerUser(chatData) {
    const totalWordCounts = {};

    for (const entry of chatData) {
        const user = entry[2];
        let msg = entry[3];
        msg = msg.toLowerCase();
        const words = msg.split(/\s+/);

        totalWordCounts[user] = (totalWordCounts[user] || 0) + words.length;
    }

    const sortedTotalWordCounts = Object.entries(totalWordCounts).sort((a, b) => b[1] - a[1]);

    return sortedTotalWordCounts;
}


function countWordsTotal(chatData) {
    let totalWordsUsed = 0;

    for (const entry of chatData) {
        let msg = entry[3];
        msg = msg.toLowerCase();
        const words = msg.split(/\s+/);

        totalWordsUsed += words.length;
    }

    return totalWordsUsed;
}


function returnLongestSentenceWords(chatData) {
    const lenSentences = {};

    for (const entry of chatData) {
        const user = entry[2];
        const msg = entry[3];

        const msgLower = msg.toLowerCase();
        const wordCount = msgLower.split(/\s+/).length;

        if (!lenSentences[user] || wordCount > lenSentences[user]['length']) {
            lenSentences[user] = {'length': wordCount, 'message': msg, 'user': user};
        }
    }

    const sortedLenSentences = Object.entries(lenSentences).sort((a, b) => b[1]['length'] - a[1]['length']);

    return sortedLenSentences;
}


function returnAvgLenSentences(chatData) {
    const sentences = [];

    for (const entry of chatData) {
        const msg = entry[3];

        const msgLower = msg.toLowerCase();
        const msgSplit = msgLower.split(/\s+/);

        const wordCountPerSentence = msgSplit.length;

        sentences.push(wordCountPerSentence);
    }

    const avgSentences = sentences.length > 0 ? (sentences.reduce((acc, val) => acc + val) / sentences.length) : 0;

    return avgSentences.toFixed(2);
}


function countMsgsPerDay(chatData) {
    const messageCountByDay = {};

    for (const entry of chatData) {
        try {
            const date = entry[0];
            const dateObj = new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
            const day = dateObj.toISOString().split('T')[0];

            messageCountByDay[day] = (messageCountByDay[day] || 0) + 1;
        } catch (error) {
            console.log('Found incorrect format.');
        }
    }

    const sortedMsgCountByDay = Object.entries(messageCountByDay).sort((a, b) => b[1] - a[1]);

    return sortedMsgCountByDay;
}


function countMsgsTotal(chatData) {
    const msgCount = chatData.length;
    return msgCount;
}


function countWordsPerDay(chatData) {
    const wordCountByDay = {};

    for (const entry of chatData) {
        const date = entry[0];
        const dateObj = new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        const day = dateObj.toISOString().split('T')[0];

        const msg = entry[3].toLowerCase();
        const msgSplit = msg.split(/\s+/);

        for (const word of msgSplit) {
            wordCountByDay[day] = (wordCountByDay[day] || 0) + 1;
        }
    }

    const sortedWordCountByDay = Object.entries(wordCountByDay).sort((a, b) => b[1] - a[1]);

    return sortedWordCountByDay;
}


function returnEmoji(i) {
    i += 1;
    let emoji = '';

    switch (i) {
        case 1:
            emoji = '🥇';
            break;
        case 2:
            emoji = '🥈';
            break;
        case 3:
            emoji = '🥉';
            break;
        default:
            emoji = '';
    }

    return emoji;
}


function countHours(chatData) {
    const hourCount = {};

    for (const entry of chatData) {
        const time = entry[1];
        const hour = time.split(':')[0];
        hourCount[hour] = (hourCount[hour] || 0) + 1;
    }

    const sortedHourCount = Object.entries(hourCount).sort((a, b) => b[1] - a[1]);

    return sortedHourCount;
}


function drawChart(dataset, id, chartName, type) {
    const labels = dataset.map(entry => entry[0]);
    const data = dataset.map(entry => entry[1]);

    const ctx = document.getElementById(id).getContext('2d');
    const chart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: chartName,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};