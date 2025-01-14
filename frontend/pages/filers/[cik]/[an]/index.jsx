export const getServerSideProps = async ({ resolvedUrl, query }) => {
  const cleanPath = resolvedUrl.replace(/\/$/, "");
  const newPath = `${cleanPath}/holdings`;
  return {
    redirect: {
      destination: newPath,
      permanent: true,
    },
  };
};

export default function FilingRedirect() {
  return null;
}
