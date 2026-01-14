import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CGU = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») encadrent l'accès et l'utilisation de l'application en cours de développement (ci-après « l'Application »). En utilisant l'Application, l'utilisateur accepte pleinement et sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Accès au service</h2>
            <p className="text-muted-foreground">
              L'Application est actuellement en phase de développement et peut contenir des fonctionnalités incomplètes, instables ou sujettes à modification. L'accès peut être interrompu à tout moment pour maintenance, mise à jour ou évolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation de l'Application</h2>
            <p className="text-muted-foreground mb-4">L'utilisateur s'engage à :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>utiliser l'Application conformément aux lois en vigueur ;</li>
              <li>ne pas tenter de nuire au bon fonctionnement du service ;</li>
              <li>ne pas utiliser l'Application à des fins frauduleuses, malveillantes ou illégales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble des contenus, éléments graphiques, textes, logos, fonctionnalités et technologies intégrés dans l'Application sont protégés par les lois relatives à la propriété intellectuelle. Toute reproduction ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
            <p className="text-muted-foreground">
              L'Application peut collecter certaines données techniques nécessaires à son fonctionnement. Pour plus d'informations, veuillez consulter la{" "}
              <Link to="/politique-confidentialite" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
            <p className="text-muted-foreground">
              L'Application est fournie « telle quelle », sans garantie de disponibilité, de performance ou d'exactitude. L'éditeur ne pourra être tenu responsable en cas de dommages directs ou indirects liés à l'utilisation ou à l'impossibilité d'utiliser l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Modifications des CGU</h2>
            <p className="text-muted-foreground">
              Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront invités à consulter régulièrement cette page pour prendre connaissance des éventuelles mises à jour.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant les CGU, vous pouvez contacter l'éditeur à l'adresse suivante : contact@example.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGU;
