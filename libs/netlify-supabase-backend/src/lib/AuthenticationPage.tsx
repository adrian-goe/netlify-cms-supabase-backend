import React from 'react';
import supabase from './supabase';
import styled from '@emotion/styled';

const StyledAuthenticationPage = styled.section`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Form = styled.form`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const AuthenticationPage = (props: { onLogin: () => void; supabase: any }) => {
  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { user, error } = await supabase.auth.signIn({
      email: e.target.elements.email.value,
      password: e.target.elements.password.value,
    });
    if (error) {
      console.log(error); // Failure
    }
    if (user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.onLogin(user);
    }
  };

  return (
    <>
      <StyledAuthenticationPage>
        <Form onSubmit={(event) => handleLogin(event)}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          <button type="submit">Login</button>
        </Form>
      </StyledAuthenticationPage>
    </>
  );
};

export default AuthenticationPage;
