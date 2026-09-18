import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro não tratado na aplicação:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ padding: '80px 20px' }} role="alert">
          <h1>Algo deu errado</h1>
          <p>Desculpe, encontramos um erro inesperado. Tente recarregar a página.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
