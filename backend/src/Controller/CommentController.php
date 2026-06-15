<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Ticket;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tickets/{ticketId}/comments')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class CommentController extends AbstractController
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'comment_list', methods: ['GET'])]
    public function list(int $ticketId): JsonResponse
    {
        $ticket = $this->ticketRepository->find($ticketId);

        if (!$ticket) {
            return $this->json(['message' => 'Ticket not found'], 404);
        }

        if (!$this->canAccess($ticket)) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $comments = array_map(fn($c) => [
            'id'        => $c->getId(),
            'content'   => $c->getContent(),
            'createdAt' => $c->getCreatedAt()->format('Y-m-d H:i:s'),
            'author'    => [
                'id'        => $c->getAuthor()->getId(),
                'email'     => $c->getAuthor()->getEmail(),
                'firstName' => $c->getAuthor()->getFirstName(),
                'lastName'  => $c->getAuthor()->getLastName(),
            ],
        ], $ticket->getComments()->toArray());

        return $this->json($comments);
    }

    #[Route('', name: 'comment_create', methods: ['POST'])]
    public function create(int $ticketId, Request $request): JsonResponse
    {
        $ticket = $this->ticketRepository->find($ticketId);

        if (!$ticket) {
            return $this->json(['message' => 'Ticket not found'], 404);
        }

        if (!$this->canAccess($ticket)) {
            return $this->json(['message' => 'Access denied'], 403);
        }

        $body = json_decode($request->getContent(), true);

        if (empty($body['content'])) {
            return $this->json(['message' => 'Content is required'], 400);
        }

        $comment = new Comment();
        $comment->setContent($body['content']);
        $comment->setTicket($ticket);
        $comment->setAuthor($this->getUser());

        $this->em->persist($comment);
        $this->em->flush();

        return $this->json([
            'id'        => $comment->getId(),
            'content'   => $comment->getContent(),
            'createdAt' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            'author'    => [
                'id'        => $comment->getAuthor()->getId(),
                'email'     => $comment->getAuthor()->getEmail(),
                'firstName' => $comment->getAuthor()->getFirstName(),
                'lastName'  => $comment->getAuthor()->getLastName(),
            ],
        ], 201);
    }

    private function canAccess(Ticket $ticket): bool
    {
        $user = $this->getUser();
        $roles = $user->getRoles();

        return $ticket->getUser() === $user
            || in_array('ROLE_ADMIN', $roles)
            || in_array('ROLE_AGENT', $roles);
    }
}
