import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center gap-8 py-24">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="font-display-x text-display-xl">
        Out of
        <br />
        bounds.
      </h1>
      <p className="max-w-md text-fg-muted">
        This level hasn&apos;t been built yet — or the link fell through the floor.
      </p>
      <div>
        <ButtonLink href="/" variant="secondary" trailingIcon={<ArrowRight />}>
          Back to spawn
        </ButtonLink>
      </div>
    </Container>
  );
}
