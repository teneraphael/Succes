import WebPageShortcut from '@/components/WebPageShortcut';

export default function CreateScreen() {
  return <WebPageShortcut title="Publier une annonce" description="La publication s’ouvre sur le site DealCity dans votre navigateur. Connectez-vous avec votre compte habituel pour ajouter vos photos et publier." path="/post/new" buttonLabel="Ouvrir la publication" />;
}
