import { Link } from "react-router-dom";
import { MdLogout, MdAutoStories } from "react-icons/md";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const NavBar = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setRole(data.role);
        }
      }
    };

    fetchRole();
  }, []);

  return (
    <nav className="navbar is-dark has-shadow is-spaced" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <span className="navbar-item has-text-weight-bold has-text-warning mr-5">MyDATA</span>
      </div>

      <div className="navbar-menu is-active">
        <div className="navbar-start">
          {role === "worker" && (
            <Link 
              to="/daily-report" 
              className="navbar-item has-text-white has-text-weight-semibold"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <span className="icon mr-2" style={{ fontSize: '1.5rem' }}>
                <MdAutoStories size={24} />
              </span>
            </Link>
          )}

          {role === "staff" && (
            <>
              <Link to="/order-entry" className="navbar-item has-text-white has-text-weight-semibold">
                発注入力
              </Link>
              <Link to="/cost-summary" className="navbar-item has-text-white has-text-weight-semibold">
                原価集計
              </Link>
              <Link to="/wage-manager" className="navbar-item has-text-white has-text-weight-semibold">
                時給管理
              </Link>
            </>
          )}

          {role === "sales" && (
            <>
              <Link to="/project-entry" className="navbar-item has-text-white has-text-weight-semibold">
                工事登録
              </Link>
              <Link to="/order-entry" className="navbar-item has-text-white has-text-weight-semibold">
                発注入力
              </Link>
            </>
          )}
        </div>

        <div className="navbar-end">
          <Link
            to="/login"
            className="navbar-item button is-danger is-light is-rounded has-text-weight-bold"
          >
            <span className="icon mr-1">
              <MdLogout />
            </span>
            <span>ログアウト</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;