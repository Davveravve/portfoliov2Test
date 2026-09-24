import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center gap-8 py-24">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="max-w-[22ch] headline text-display-xl">
        <Emphasis text="Out of bounds. *This level isn't built yet.*" />
      </h1>
      <p className="max-w-md text-body-lg text-fg-muted">The link may have fallen through the floor.</p>
      <div>
        <ButtonLink href="/" variant="secondary" trailingIcon={<ArrowRight />}>
          Back to spawn
        </ButtonLink>
      </div>
    </Container>
  );
}
