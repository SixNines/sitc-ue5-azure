import { useRouter } from 'next/router'
import { AuthorizedRoute } from 'components';


const Destroy = () => {
  const router = useRouter();
  const { stack } = router.query;

  return (
    <AuthorizedRoute adminRoute={false}>
      <div>
        <h2>Destroy</h2>
        <p>{stack}</p>
      </div>
    </AuthorizedRoute>
  )
};

export default Destroy;
