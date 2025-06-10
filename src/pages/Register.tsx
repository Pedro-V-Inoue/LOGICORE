import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("worker"); // デフォルトはworker
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const validRoles = ["worker", "staff", "sales"];
    if (!validRoles.includes(role)) {
      alert("役職を正しく選択してください。");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role, // worker, staff, sales を送る
        },
      },
    });

    if (error) {
      alert("登録エラー: " + error.message);
      return;
    }

    alert("仮登録が完了しました。メールを確認してください。");
    navigate("/login");
  };

  return (
    <form onSubmit={handleRegister} className="box" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <h1 className="title has-text-centered has-text-primary">新規登録</h1>

      <div className="field is-horizontal">
        <div className="field-label is-normal" style={{ minWidth: '6rem' }}>
          <label htmlFor="name" className="label" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            名前
          </label>
        </div>
        <div className="field-body">
          <div className="field">
            <p className="control">
              <input
                id="name"
                type="text"
                placeholder="名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
            </p>
          </div>
        </div>
      </div>

      <div className="field is-horizontal">
        <div className="field-label is-normal" style={{ minWidth: '6rem' }}>
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
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
        <div className="field-label is-normal" style={{ minWidth: '6rem' }}>
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
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                style={{ height: '2.5rem' }}
              >
                {showPassword ? <MdVisibility /> : <MdVisibilityOff /> }
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="field is-horizontal">
        <div className="field-label is-normal" style={{ minWidth: '6rem' }}>
          <label htmlFor="role" className="label" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
            役職
          </label>
        </div>
        <div className="field-body">
          <div className="field">
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="worker">作業員</option>
                  <option value="staff">事務</option>
                  <option value="sales">営業</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="field mt-5">
        <button type="submit" className="button is-primary is-fullwidth">
          ユーザー登録
        </button>
      </div>

      <div className="field mt-3">
        <Link to="/login" className="button is-light is-fullwidth">
          ログインに戻る
        </Link>
      </div>
    </form>
  );
};

export default Register;
