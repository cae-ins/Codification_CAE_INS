import { Box, Container } from "@mui/material";

export default function ComponentFooter() {
  return (
    <Container className="child" maxWidth="lg">
        <Box>
            <h3 className="footer">
            © 2024 INS-CI<span> - Institut National de la Statistique de Côte d'Ivoire </span>
            </h3>
        </Box>
    </Container>
  );
}
