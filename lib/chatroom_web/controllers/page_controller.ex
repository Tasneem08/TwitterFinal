defmodule ChatroomWeb.PageController do
  use ChatroomWeb, :controller

  def index(conn, _params) do
    render conn, "home.html"
  end

  def dashboard(conn, _params) do
    render conn, "dashboard.html"
  end
end
