import { Input, Button } from 'antd';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import RenderIf from '@/shared/components/RenderIf';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'antd/dist/reset.css';
import styles from './Login.module.scss';
import api from '@/api';
import registerImg from '@/assets/images/registerImg.png'
import { Urls } from '@/shared/constants/Urls';

const Login = () => {
  const { t, ready } = useTranslation();
  const navigate = useNavigate();

  const { control, formState: { errors }, handleSubmit } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  if (!ready) return null;

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password
      };

      const res = await api.post("/auth/login", payload);

      // Backenddən gələn tokeni alırıq

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("fullName", res.data.user.full_name);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("phone", res.data.user.phone || "");
      localStorage.setItem("location", res.data.user.location || "");

      window.dispatchEvent(new Event("loginStatusChanged"));
      toast.success("Login uğurlu oldu!");
      // window.location.reload();

      navigate("/");
      // console.log(res.data.token)
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login uğursuz oldu!");
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginLeft}>
        <img className={styles.loginImg} src={registerImg} alt="" />
      </div>
      <div className={styles.loginRight}>
        <div className={styles.loginDiv}>
          <h2 className={styles.loginDivh2}>{t('login.title')}</h2>
        </div>

        <form className={styles.loginRightForm} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputWrap}>
            <Controller
              name='email'
              control={control}
              rules={{
                required: t('login.errors.contactRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('login.errors.contactInvalid')
                }
              }}
              render={({ field }) => (
                <Input
                  className={styles.loginFormInp}
                  {...field}
                  placeholder={t('login.contact')}
                  status={errors.email ? 'error' : ''}
                />
              )}
            />
            <RenderIf condition={errors.email?.message}>
              <span className={styles.errorMessage}>{errors.email?.message}</span>
            </RenderIf>
          </div>

          <div className={styles.inputWrap}>
            <Controller
              name='password'
              control={control}
              rules={{ required: t('login.errors.password') }}
              render={({ field }) => (
                <Input.Password
                  className={styles.loginFormInp}
                  {...field}
                  placeholder={t('login.password')}
                  status={errors.password ? 'error' : ''}
                />
              )}
            />
            <RenderIf condition={errors.password?.message}>
              <span className={styles.errorMessage}>{errors.password?.message}</span>
            </RenderIf>
          </div>

          <div className={styles.loginFormBottom}>
            <Button type='primary' className={styles.loginFormBtn} htmlType='submit'>
              <span>{t('login.submit')}</span>
            </Button>
            <Link className={styles.loginFormLink} to={Urls.REGISTER}>
              Hesabınız yoxdur? Qeydiyyatdan keçin
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
