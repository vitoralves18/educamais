import PublicHeader from '../components/PublicHeader';

export default function Sobre() {
  return (
    <div>
      <PublicHeader />
      <div className="sobre-copy" id="main-content">
        <h1>Sobre o EducaMais+</h1>
        <p>
          Somos uma plataforma especializada no ensino para estudantes com necessidades
          especiais. Nosso principal objetivo é atender as demandas de cada aluno de acordo
          com sua dificuldade.
        </p>
        <p>
          Nessa perspectiva, nosso ambiente permite a integração entre os alunos por meio do
          fórum, onde é possível interagir um com o outro, bem como com o professor, além de
          oferecer recursos personalizados para facilitar o aprendizado e um ambiente
          extremamente amigável, diverso e inclusivo.
        </p>
        <h2 style={{ marginTop: 32 }}>O que você encontra aqui</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Biblioteca de materiais adaptados: vídeos, textos e atividades interativas</li>
          <li>Ferramentas de acessibilidade: leitor de tela, contraste e ajuste de fonte</li>
          <li>Fórum e chats para troca de experiências e suporte</li>
          <li>Acompanhamento de progresso para tutores e responsáveis</li>
        </ul>
      </div>
    </div>
  );
}
