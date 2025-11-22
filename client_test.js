const net = require('net');

const client = net.createConnection({ port: 5000 }, () => {
    console.log('[클라이언트] 서버에 연결되었습니다.');
    client.write('상태 체크 시작 요청\n');
});

client.on('data', (data) => {
    console.log(`${data.toString().trim()}`);
});

client.on('end', () => {
    console.log('[클라이언트] 서버와의 연결이 종료되었습니다.');
});

client.on('error', (err) => {
    console.log(`[클라이언트] 에러: ${err.message}`);
});