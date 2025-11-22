const containor = document.querySelector('.containor');
const RegisterLink = document.querySelector('.SignUpLink');
const LoginLink = document.querySelector('.SigninLink');

const loginForm = document.getElementById('loginForm');
const loginIdInput = document.querySelector('.form-box.login input[name="_id"]');
const loginPwdInput = document.querySelector('.form-box.login input[name="_pwd"]');

const registerIdInput = document.querySelector('.form-box.Register input[name="_id"]');
const registerMailInput = document.querySelector('.form-box.Register input[name="_mail"]');
const registerPwdInput = document.querySelector('.form-box.Register input[name="_pwd"]');

RegisterLink.addEventListener('click', () => {
    containor.classList.add('active');
    loginIdInput.value = '';
    loginPwdInput.value = '';
});

LoginLink.addEventListener('click', () => {
    containor.classList.remove('active');
    registerIdInput.value = '';
    registerMailInput.value = '';
    registerPwdInput.value = '';
});
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const _id = loginIdInput.value;
    const _pwd = loginPwdInput.value;

    if (!_id || !_pwd) {
        alert('아이디와 비밀번호를 모두 입력하세요.');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id, _pwd }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
        }

        if (data.success) {
            alert('로그인 성공!');
            document.body.classList.add('page-slide-out');

            setTimeout(() => {
                window.location.href = data.redirect || '/main';
            }, 1000);

        } else {
            alert(data.message || '로그인에 실패했습니다.');
        }

    } catch (error) {
        console.error('로그인 요청 오류:', error);
        alert(error.message || '서버 오류가 발생했습니다.');
        document.body.classList.remove('page-slide-out');
    }
});
