export const getServerSideProps = async ({ resolvedUrl, query }) => {
  const cleanPath = resolvedUrl.replace(/\/$/, "");
  const newPath = `${cleanPath}/overview`;
  return {
    redirect: {
      destination: newPath,
      permanent: true,
    },
  };
};

export default function FilerRedirect() {
  return null;
}
