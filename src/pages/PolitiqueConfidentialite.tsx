import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PolitiqueConfidentialite = () => {
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
          Politique de Confidentialité
        </h1>

        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              La présente Politique de Confidentialité explique comment l'Application en cours de développement (ci-après « l'Application ») collecte, utilise et protège les données des utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Données collectées</h2>
            <p className="text-muted-foreground mb-4">L'Application peut collecter les types de données suivants :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Données techniques : adresse IP, type d'appareil, système d'exploitation, logs d'erreurs.</li>
              <li>Données fournies volontairement par l'utilisateur (si applicable) : email, pseudonyme, préférences.</li>
            </ul>
            <p className="text-muted-foreground mt-4">Aucune donnée sensible n'est collectée.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Finalités de la collecte</h2>
            <p className="text-muted-foreground mb-4">Les données collectées servent à :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>assurer le fonctionnement technique de l'Application ;</li>
              <li>améliorer la stabilité, la sécurité et les performances ;</li>
              <li>permettre le développement et les tests des fonctionnalités.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Base légale</h2>
            <p className="text-muted-foreground mb-4">Le traitement des données repose sur :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>l'intérêt légitime de l'éditeur à développer et améliorer l'Application ;</li>
              <li>le consentement de l'utilisateur lorsque celui-ci est requis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Partage des données</h2>
            <p className="text-muted-foreground mb-4">
              Les données ne sont jamais vendues. Elles peuvent être partagées uniquement avec :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>des prestataires techniques nécessaires au fonctionnement (hébergement, analytics, logs) ;</li>
              <li>des services tiers utilisés dans le cadre du développement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Sécurité</h2>
            <p className="text-muted-foreground">
              L'éditeur met en place des mesures raisonnables pour protéger les données contre l'accès non autorisé, la perte ou la modification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Durée de conservation</h2>
            <p className="text-muted-foreground">
              Les données sont conservées uniquement le temps nécessaire au développement, au test et à l'amélioration de l'Application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Droits des utilisateurs</h2>
            <p className="text-muted-foreground mb-4">
              Conformément au RGPD, l'utilisateur dispose des droits suivants :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>droit d'accès ;</li>
              <li>droit de rectification ;</li>
              <li>droit de suppression ;</li>
              <li>droit d'opposition ;</li>
              <li>droit à la limitation du traitement.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Pour exercer ces droits, contactez : contact@example.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modifications</h2>
            <p className="text-muted-foreground">
              Cette Politique de Confidentialité peut être mise à jour à tout moment. La version la plus récente est toujours disponible sur cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant la confidentialité, contactez : contact@example.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
