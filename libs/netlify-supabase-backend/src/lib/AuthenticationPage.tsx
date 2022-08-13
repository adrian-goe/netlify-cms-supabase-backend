import React from 'react';
import styled from '@emotion/styled';
import { createClient } from '@supabase/supabase-js';
import { Credentials } from 'netlify-cms-lib-util/src';

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

const AuthenticationPage = (props: {
  onLogin: (credentials: Credentials) => void;
  config: any;
}) => {
  const supabase = createClient(
    props.config.backend.url,
    props.config.backend.supabaseKey
  );
  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { error, session } = await supabase.auth.signIn({
      email: e.target.elements.email.value,
      password: e.target.elements.password.value,
    });
    if (error) {
      console.log(error); // Failure
    }
    if (session) {
      await props.onLogin({
        token: session.access_token,
        refresh_token: session.refresh_token,
      });
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

// export default AuthenticationPage;

module.exports = AuthenticationPage;
