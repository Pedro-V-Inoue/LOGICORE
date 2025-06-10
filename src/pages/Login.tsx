import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      let role = "worker";

      if (profileError) {
        const name = user.user_metadata.name || "";
        role = user.user_metadata.role || "worker";

        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          name,
          role,
        });

        if (insertError) {
          setErrorMsg("プロフィール登録エラー: " + insertError.message);
          return;
        }
      } else {
        role = profileData.role;
      }

      switch (role) {
        case "worker":
          navigate("/daily-report");
          break;
        case "staff":
          navigate("/cost-summary");
          break;
        case "sales":
          navigate("/project-entry");
          break;
      }
    }
  };

  return (
    <div className="has-background-dark" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="is-flex is-justify-content-center is-align-items-center" style={{ minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleLogin} className="box" style={{ width: '100%', maxWidth: '1920px' }}>
          <h1 className="title has-text-centered has-text-primary mb-5" style={{ fontSize: '4rem' }}>LOGICORE</h1>
          <p className="subtitle has-text-centered has-text-grey">アカウントにログインしてください</p>

          <div className="field is-horizontal">
            <div className="field-label is-normal" style={{ minWidth: '8rem' }}>
              <label htmlFor="email" className="label" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                メールアドレス
              </label>
            </div>
            <div className="field-body">
              <div className="field">
                <p className="control has-icons-left">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレス"
                    className="input"
                    required
                  />
                  <span className="icon is-small is-left">
                    <MdEmail className="has-text-grey-light" />
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="field is-horizontal">
            <div className="field-label is-normal" style={{ minWidth: '8rem' }}>
              <label htmlFor="password" className="label" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                パスワード
              </label>
            </div>
            <div className="field-body">
              <div className="field has-addons has-addons-left">
                <p className="control is-expanded has-icons-left">
                  <span className="icon is-small is-left">
                    <MdLock className="has-text-grey-light" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    className="input"
                    required
                  />
                </p>
                <p className="control">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="button is-light"
                    aria-label="Toggle password visibility"
                    style={{height: '2.5rem'}}
                  >
                    {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="field">
            <button type="submit" className="button is-primary is-fullwidth mt-5">
              ログイン
            </button>
          </div>

          {errorMsg && <p className="has-text-danger has-text-centered">{errorMsg}</p>}

          <p className="has-text-centered mt-4 has-text-grey">
            アカウントをお持ちでない方は{' '}
            <Link to="/register" className="has-text-link has-text-underlined">
              新規登録
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;